const TODOS: { label: string; done: boolean }[] = [
  { label: "Cockpit 'The Pit' live zetten", done: false },
  { label: "GitHub-token koppelen", done: false },
  { label: "Eerste agent werven", done: false },
  { label: "Agent OS bootstrap", done: true },
];

/**
 * A simple to-do list for Cos's bring-up tasks.
 *
 * @returns The to-do list element.
 */
export function ToDoList(): React.ReactElement {
  return (
    <ul className="flex flex-col gap-2">
      {TODOS.map((todo) => (
        <li key={todo.label} className="flex items-center gap-2 text-sm">
          <span
            className={`grid h-4 w-4 place-items-center rounded border ${
              todo.done ? "border-ok bg-ok/20 text-ok" : "border-edge text-transparent"
            }`}
          >
            ✓
          </span>
          <span className={todo.done ? "text-muted line-through" : "text-slate-200"}>
            {todo.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
