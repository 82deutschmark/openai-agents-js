import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

import type { AgentInputItem } from '@openai/agents';
import { Runner } from '@openai/agents';

import { createHobbyFarmAdvisorAgent } from '@/agents';
import {
  getConversationMemory,
  persistConversationHistory,
  SHARED_VECTOR_STORE_ID,
} from '@/lib/conversation-memory';

function generateConversationId() {
  return `biz_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const messages: AgentInputItem[] = data.messages ?? [];
    let { conversationId } = data;

    if (!conversationId) {
      conversationId = generateConversationId();
    }

    const existingMemory = await getConversationMemory(conversationId);
    const memoryVectorStoreId =
      existingMemory?.vectorStoreId ?? SHARED_VECTOR_STORE_ID;

    const hobbyFarmAdvisorAgent = createHobbyFarmAdvisorAgent({
      memoryVectorStoreId,
    });

    const runner = new Runner({
      groupId: conversationId,
    });

    const result = await runner.run(hobbyFarmAdvisorAgent, messages);

    const updatedMemory = await persistConversationHistory({
      conversationId,
      history: result.history,
      existingRecord: existingMemory,
    });

    return NextResponse.json({
      response: result.finalOutput,
      history: result.history,
      conversationId,
      memoryVectorStoreId: updatedMemory?.vectorStoreId ?? memoryVectorStoreId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
