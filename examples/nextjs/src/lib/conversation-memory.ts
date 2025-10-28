import type { AgentInputItem } from '@openai/agents';
import OpenAI, { toFile } from 'openai';

import { Database } from '@/db';

export type ConversationMemoryRecord = {
  vectorStoreId: string;
  storedItemCount: number;
};

const memoryDb = new Database<ConversationMemoryRecord>();

export const SHARED_VECTOR_STORE_ID =
  process.env.OPENAI_VECTOR_STORE_ID ?? 'vs_68fffb393e7c81918c53643ecf212d0f';

let client: OpenAI | undefined;

function getClient() {
  if (client) {
    return client;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required to store conversation memory.');
  }

  client = new OpenAI({
    apiKey,
  });

  return client;
}

function extractMessageContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part || typeof part !== 'object') {
          return '';
        }

        if ('text' in part && typeof part.text === 'string') {
          return part.text;
        }

        if ('transcript' in part && typeof part.transcript === 'string') {
          return part.transcript;
        }

        if ('refusal' in part && typeof part.refusal === 'string') {
          return part.refusal;
        }

        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  return '';
}

function formatHistoryItems(items: AgentInputItem[]): string[] {
  return items
    .map((item) => {
      if (item.type === 'message') {
        const role = item.role ?? 'assistant';
        const content = extractMessageContent(item.content);
        const trimmed = content.trim();
        if (!trimmed) {
          return null;
        }
        return `${role.toUpperCase()}: ${trimmed}`;
      }

      if (item.type === 'function_call') {
        const args =
          typeof item.arguments === 'string'
            ? item.arguments
            : JSON.stringify(item.arguments);
        return `TOOL_CALL ${item.name ?? 'unknown'}(${args ?? ''})`;
      }

      if (item.type === 'function_call_result') {
        const output =
          typeof item.output === 'string'
            ? item.output
            : item.output && typeof item.output === 'object'
              ? 'text' in item.output && typeof item.output.text === 'string'
                ? item.output.text
                : 'data' in item.output && typeof item.output.data === 'string'
                  ? item.output.data
                  : ''
              : '';
        if (!output) {
          return null;
        }
        return `TOOL_RESULT ${item.callId ?? ''}: ${output}`;
      }

      return null;
    })
    .filter((value): value is string => Boolean(value));
}

export async function getConversationMemory(
  conversationId: string,
): Promise<ConversationMemoryRecord | undefined> {
  const record = await memoryDb.get(conversationId);

  if (record) {
    return record;
  }

  return {
    vectorStoreId: SHARED_VECTOR_STORE_ID,
    storedItemCount: 0,
  };
}

export async function persistConversationHistory({
  conversationId,
  history,
  existingRecord,
}: {
  conversationId: string;
  history: AgentInputItem[];
  existingRecord?: ConversationMemoryRecord | null;
}): Promise<ConversationMemoryRecord | undefined> {
  let record = existingRecord ??
    (await memoryDb.get(conversationId)) ?? {
      vectorStoreId: SHARED_VECTOR_STORE_ID,
      storedItemCount: 0,
    };
  const previouslyStored = record?.storedItemCount ?? 0;
  const newItems = history.slice(previouslyStored);

  if (newItems.length === 0) {
    if (record && record.storedItemCount !== history.length) {
      const updated: ConversationMemoryRecord = {
        ...record,
        storedItemCount: history.length,
      };
      await memoryDb.set(conversationId, updated);
      return updated;
    }
    return record ?? undefined;
  }

  const formatted = formatHistoryItems(newItems);

  if (formatted.length === 0) {
    if (record) {
      const updated: ConversationMemoryRecord = {
        ...record,
        storedItemCount: history.length,
      };
      await memoryDb.set(conversationId, updated);
      return updated;
    }
    return record ?? undefined;
  }

  const fileName = `${conversationId}-${Date.now()}.txt`;
  const transcript = formatted.join('\n\n');
  const file = await toFile(Buffer.from(transcript, 'utf-8'), fileName);

  await getClient().vectorStores.files.uploadAndPoll(
    record.vectorStoreId,
    file,
  );

  const updatedRecord: ConversationMemoryRecord = {
    ...record,
    storedItemCount: history.length,
  };
  await memoryDb.set(conversationId, updatedRecord);

  return updatedRecord;
}
