"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/app/logout-button";
import { createClient } from "@/lib/supabase";

type Task = {
    id: number;
    task: string;
    completed: boolean;
};

export default function Home() {
    const supabase = createClient();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        async function loadTasks() {
            const { data } = await supabase
                .from("tasks")
                .select("id, task, completed")
                .order("id");

            setTasks(data || []);
            setLoading(false);
        }

        loadTasks();
    }, []);

    useEffect(() => {
        async function loadUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            setUser(user);
        }

        loadUser();
    }, []);

    const completedCount = tasks.filter((task) => task.completed).length;

    return (
        <>
            <nav className="navbar">
                <div className="logo">TaskFlow</div>

                <div className="nav-links">
                    <Link href="/" className="nav-link">
                        Tasks
                    </Link>

                    {user ? (
                        <>
                            <Link href="/profile" className="nav-link">
                                Profile
                            </Link>
                            <Link href="/dashboard" className="nav-link">
                                Dashboard
                            </Link>
                            <LogoutButton />
                        </>
                    ) : (


                        <Link href="/login" className="nav-link">
                            Login
                        </Link>
                    )}
                </div>

            </nav>

            <main className="page">
                <div className="page-header">
                    <div>
                        <h1>My Tasks</h1>
                        <p className="subtitle">
                            Stay organized and keep track of what needs to get done.
                        </p>
                    </div>

                    <div className="task-summary">
                        {completedCount} of {tasks.length} completed
                    </div>
                </div>

                <div className="card">
                    {loading ? (
                        <p>Loading tasks...</p>
                    ) : tasks.length === 0 ? (
                        <p>No tasks yet.</p>
                    ) : (
                        <div className="task-list">
                            {tasks.map((task) => (
                                <div className="task" key={task.id}>
                                    <div>
                                        <strong className={task.completed ? "completed" : ""}>
                                            {task.task}
                                        </strong>
                                    </div>

                                    <span className="status">
                    {task.completed ? "Completed" : "Not completed"}
                  </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}