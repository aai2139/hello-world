import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .order("id");

  if (error) {
    return <main><p>Error loading tasks: {error.message}</p></main>;
  }

  return (
      <main style={{ padding: "40px" }}>
        <h1>My Tasks</h1>

        <ul>
          {tasks?.map((task) => (
              <li key={task.id}>
                {task.task} — {task.completed ? "Completed" : "Not completed"}
              </li>
          ))}
        </ul>
      </main>
  );
}