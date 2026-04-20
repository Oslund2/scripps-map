import { useState, useRef, useEffect } from 'react';
import { buildSystemPrompt, setFccStations } from '../ai/systemPrompt';
import { supabase } from '../lib/supabase';

const DIRECT_API_URL = 'https://api.anthropic.com/v1/messages';
const PROXY_PATH = '/api/chat';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 8096;

export default function useSwapAnalyzer() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [persona, setPersona] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const abortRef = useRef(null);
  const systemPromptRef = useRef(null);

  const clientApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  const apiKeyConfigured = true;

  // Load FCC competitor data into system prompt on mount
  useEffect(() => {
    if (!supabase) return;
    supabase.from('fcc_stations')
      .select('callsign, network, owner_group, dma_name, dma_rank, city, state, is_scripps, is_inyo')
      .order('dma_rank', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setFccStations(data);
          systemPromptRef.current = null;
        }
      });
  }, []);

  function getSystemPrompt() {
    // Rebuild every time if customizations exist (they may change between sends)
    if (persona || additionalInstructions || !systemPromptRef.current) {
      systemPromptRef.current = buildSystemPrompt({ persona, additionalInstructions });
    }
    return systemPromptRef.current;
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  async function sendMessage(text) {
    if (!text.trim() || isStreaming) return;
    setError(null);

    const userMsg = { role: 'user', content: text.trim() };
    const assistantMsg = { role: 'assistant', content: '' };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
    const systemPrompt = getSystemPrompt();

    const controller = new AbortController();
    abortRef.current = controller;

    let fullResponse = '';

    try {
      let res;
      try {
        res = await fetch(PROXY_PATH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, system: systemPrompt, model: MODEL, max_tokens: MAX_TOKENS }),
          signal: controller.signal,
        });
        if (res.status === 404) throw new Error('proxy not available');
      } catch (proxyErr) {
        if (proxyErr.name === 'AbortError') throw proxyErr;
        if (!clientApiKey) throw new Error('No API key configured. Add VITE_ANTHROPIC_API_KEY to .env.local for local dev, or deploy to Netlify.');
        res = await fetch(DIRECT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': clientApiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, stream: true, system: systemPrompt, messages: apiMessages }),
          signal: controller.signal,
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let isSearching = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);

            // Web search: show searching indicator
            if (parsed.type === 'content_block_start' && parsed.content_block?.type === 'server_tool_use') {
              if (!isSearching) {
                isSearching = true;
                const searchNote = '\n\n*Searching for latest news...*\n\n';
                fullResponse += searchNote;
                setMessages(prev => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  next[next.length - 1] = { ...last, content: last.content + searchNote };
                  return next;
                });
              }
            }

            // Web search results — extract source URLs
            if (parsed.type === 'content_block_start' && parsed.content_block?.type === 'web_search_tool_result') {
              isSearching = false;
              const results = parsed.content_block?.content || [];
              if (results.length > 0) {
                let sourcesNote = '';
                for (const r of results) {
                  if (r.type === 'web_search_result' && r.url && r.title) {
                    sourcesNote += `> [${r.title}](${r.url})\n`;
                  }
                }
                if (sourcesNote) {
                  sourcesNote = '\n**Sources found:**\n' + sourcesNote + '\n';
                  fullResponse += sourcesNote;
                  setMessages(prev => {
                    const next = [...prev];
                    const last = next[next.length - 1];
                    next[next.length - 1] = { ...last, content: last.content + sourcesNote };
                    return next;
                  });
                }
              }
            }

            // Normal text delta
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              isSearching = false;
              fullResponse += parsed.delta.text;
              setMessages(prev => {
                const next = [...prev];
                const last = next[next.length - 1];
                next[next.length - 1] = { ...last, content: last.content + parsed.delta.text };
                return next;
              });
            }

            // Handle stream errors from API
            if (parsed.type === 'error') {
              throw new Error(parsed.error?.message || 'Stream error');
            }
          } catch (parseErr) {
            if (parseErr.message && parseErr.message !== 'Stream error' && !parseErr.message.includes('JSON')) {
              throw parseErr;
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        if (fullResponse && fullResponse.length > 100) {
          const note = '\n\n---\n*Analysis was truncated due to a stream error. The content above is complete up to this point. Try asking a follow-up question for the remaining sections.*';
          fullResponse += note;
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'assistant') {
              next[next.length - 1] = { ...last, content: last.content + note };
            }
            return next;
          });
        } else {
          setError(err.message);
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant' && !last.content) return prev.slice(0, -1);
            return prev;
          });
        }
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function clearMessages() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }

  return {
    messages, isStreaming, error, apiKeyConfigured,
    sendMessage, clearMessages,
    persona, setPersona,
    additionalInstructions, setAdditionalInstructions,
    getSystemPrompt,
  };
}
