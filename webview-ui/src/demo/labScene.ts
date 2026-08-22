import { useEffect } from 'react';

import type { OfficeState } from '../office/engine/officeState.js';
import { DEMO_AGENT_IDS } from './browserBridge.js';
import type { DemoRunState, RunEvent, SolverModel } from './types.js';

const HANDOFF_TILES: Record<SolverModel, { col: number; row: number }> = {
  deep: { col: 11, row: 14 },
  quick: { col: 11, row: 19 },
};

const DATA_INTAKE_TILE = { col: 21, row: 18 } as const;

function hasArrived(
  officeState: OfficeState,
  agentId: number,
  target: { col: number; row: number },
): boolean {
  const character = officeState.characters.get(agentId);
  return (
    !!character &&
    character.tileCol === target.col &&
    character.tileRow === target.row &&
    character.path.length === 0
  );
}

function solverFromEvent(event: RunEvent): SolverModel | null {
  if (event.actorId === 'deep' || event.actorId === 'quick') return event.actorId;
  if (event.targetId === 'deep' || event.targetId === 'quick') return event.targetId;
  return null;
}

/**
 * Physical gates for artifact transfer. The sequential demo runner already
 * guarantees that the analysis event completed first; these checks add the
 * second half of the contract: the carrier must also have arrived.
 */
export function isDemoEventReady(officeState: OfficeState, event: RunEvent): boolean {
  if (event.type === 'planner.document.delivered') {
    const solver = solverFromEvent(event);
    return solver ? hasArrived(officeState, DEMO_AGENT_IDS.planner, HANDOFF_TILES[solver]) : false;
  }

  if (event.type === 'document.submitted') {
    const solver = solverFromEvent(event);
    return solver ? hasArrived(officeState, DEMO_AGENT_IDS[solver], DATA_INTAKE_TILE) : false;
  }

  return true;
}

function sendRosterHome(officeState: OfficeState): void {
  for (const id of Object.values(DEMO_AGENT_IDS)) {
    officeState.setAgentActive(id, true);
    officeState.sendToSeat(id);
  }
}

/** Keep the canvas simulation synchronized with the scripted run events. */
export function useDemoOfficeChoreography(
  enabled: boolean,
  state: DemoRunState,
  officeState: OfficeState,
): void {
  const latestEvent = state.events[state.events.length - 1];

  useEffect(() => {
    if (!enabled) return;
    if (state.status === 'idle') {
      sendRosterHome(officeState);
      return;
    }
    if (!latestEvent) return;

    if (latestEvent.type === 'run.created') {
      sendRosterHome(officeState);
      return;
    }

    if (latestEvent.type === 'planner.agent.selected') {
      const solver = solverFromEvent(latestEvent);
      if (!solver) return;
      officeState.setAgentActive(DEMO_AGENT_IDS.planner, false);
      officeState.walkToTile(
        DEMO_AGENT_IDS.planner,
        HANDOFF_TILES[solver].col,
        HANDOFF_TILES[solver].row,
      );
      return;
    }

    if (latestEvent.type === 'planner.document.delivered') {
      officeState.setAgentActive(DEMO_AGENT_IDS.planner, true);
      officeState.sendToSeat(DEMO_AGENT_IDS.planner);
      return;
    }

    if (latestEvent.type === 'agent.submission.started') {
      const solver = solverFromEvent(latestEvent);
      if (!solver) return;
      const id = DEMO_AGENT_IDS[solver];
      officeState.setAgentActive(id, false);
      officeState.walkToTile(id, DATA_INTAKE_TILE.col, DATA_INTAKE_TILE.row);
      return;
    }

    if (latestEvent.type === 'document.submitted') {
      const solver = solverFromEvent(latestEvent);
      if (!solver) return;
      const character = officeState.characters.get(DEMO_AGENT_IDS[solver]);
      if (character) character.wanderTimer = 60;
    }
  }, [enabled, latestEvent, officeState, state.status]);
}
