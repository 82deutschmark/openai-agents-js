import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

import type { AgentInputItem } from '@openai/agents';
import { Runner } from '@openai/agents';

import { hobbyFarmAdvisorAgent } from '@/agents';

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

    const runner = new Runner({
      groupId: conversationId,
    });

    const result = await runner.run(hobbyFarmAdvisorAgent, messages);

    return NextResponse.json({
      response: result.finalOutput,
      history: result.history,
      conversationId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
