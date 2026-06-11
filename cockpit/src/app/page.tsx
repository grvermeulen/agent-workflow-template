import { Sidebar } from "@/components/Sidebar";
import { StatusTiles } from "@/components/StatusTiles";
import { Panel } from "@/components/Panel";
import { ToolGrid } from "@/components/ToolGrid";
import { AgentsRoster } from "@/components/AgentsRoster";
import { ActivityStream } from "@/components/ActivityStream";
import { WorkBoard } from "@/components/WorkBoard";
import { QuickLaunch } from "@/components/QuickLaunch";
import { Automations } from "@/components/Automations";
import { ToDoList } from "@/components/ToDoList";
import { PitConsole } from "@/components/PitConsole";
import { getToolStatuses, getConnectedCount } from "@/lib/services/toolStatus.service";
import { getAgents } from "@/lib/services/agents.service";
import { getBoard } from "@/lib/services/work.service";
import { getActivity } from "@/lib/services/activity.service";

export const dynamic = "force-dynamic";

/**
 * The Pit — Cos's command center. Server component that pulls live state from the
 * service layer and composes the dashboard.
 *
 * @returns The dashboard page.
 */
export default async function CockpitPage(): Promise<React.ReactElement> {
  const tools = getToolStatuses();
  const connected = getConnectedCount();
  const agents = getAgents();
  const [board, activity] = await Promise.all([getBoard(), getActivity()]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 px-5 py-5">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">The Pit</h1>
            <p className="text-sm text-muted">Jouw commandocentrum — Cos staat klaar.</p>
          </div>
          <StatusTiles connected={connected} totalTools={tools.length} board={board.summary} />
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Panel title="Tools & apps" action={`${connected} verbonden`} className="lg:col-span-8">
            <ToolGrid tools={tools} />
          </Panel>

          <Panel title="Agents" action="Nieuwe agent" className="lg:col-span-4 lg:row-span-2">
            <AgentsRoster agents={agents} />
          </Panel>

          <Panel
            title="Werk"
            action={board.live ? "live · GitHub" : "seed"}
            className="lg:col-span-8"
          >
            <WorkBoard items={board.items} />
          </Panel>

          <Panel
            title="Activiteit"
            action={activity.live ? "live" : "seed"}
            className="lg:col-span-4"
          >
            <ActivityStream items={activity.items} />
          </Panel>

          <Panel title="Snel starten" className="lg:col-span-4">
            <QuickLaunch />
          </Panel>

          <Panel title="Te doen" className="lg:col-span-4">
            <ToDoList />
          </Panel>

          <Panel title="Agent builder & automatiseringen" className="lg:col-span-12">
            <Automations />
          </Panel>
        </div>

        <div className="mt-5">
          <PitConsole />
        </div>
      </main>
    </div>
  );
}
