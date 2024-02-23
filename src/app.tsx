import { ChangeEvent, useEffect, useState } from "react";
import logo from "./assets/logo-nlw-expert.svg";
import { NewNoteCard } from "./components/new-note-card";
import { NoteCard } from "./components/note-card";
import { tursoClient } from "./lib";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react"


interface Note {
  id: string;
  date_created: Date;
  content: string;
}

export function App() {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const { user } = useUser();
  useEffect(() => {
    if (!user) return;
    const fetchData = async (): Promise<void> => {
      try {
        const result = await tursoClient.execute({sql:"SELECT * FROM frameworks WHERE user_id = ?", args: [user.id]});
        const notes: Note[] = result.rows.map((row): Note => {
          const { id, date_created, note } = row;
          return {
            id: id?.toString() || "",
            date_created: new Date(Number(date_created)),
            content: note?.toString() || "",
          };
        });

        setNotes(notes);
      } catch (error: any) {
        console.log("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [user]);


  async function onNoteCreated(content: string) {
    if (!user) return;

    const newNote = {
      id: crypto.randomUUID(),
      date_created: new Date(),
      content,
    };

    const notesArray = [newNote, ...notes];
    try {
      await tursoClient.execute({
        sql:"INSERT INTO frameworks (user_id, date_created, note) VALUES (?, ?, ?)",
        args: [ user?.id, newNote.date_created, newNote.content]
      });
    } catch (error: any) {
      console.log('Somenthing goes wrong!',error.message);
    }

    setNotes(notesArray);

  }

  /**
   * Deletes a note with the specified ID.
   * @param id - The ID of the note to be deleted.
   * @returns A promise that resolves when the note is successfully deleted.
   */
  async function onNoteDeleted(id: string): Promise<void> {
    try {
      await tursoClient.execute({
        sql: "DELETE FROM frameworks WHERE id = ?",
        args: [id]
      });
    } catch (error) {
      console.log(error);
    }
    const notesArray = notes.filter((note) => {
      return note.id !== id;
    });

    setNotes(notesArray);
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;

    setSearch(query);
  }

  const filteredNotes =
    search !== ""
      ? notes.filter((note) =>
          note.content.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        )
      : notes;


  return (
    <>
    <SignedOut>
      <SignInButton />
    </SignedOut>
    <SignedIn>
      <div className="bg-gradient-to-r from-transparent from-60% to-slate-500 tra flex justify-end p-2 h-18 items-center">
        <span className="px-4">{user?.fullName}</span>
        <UserButton />
      </div>
      <div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
        <img src={logo} alt="NLW Expert" />

        <form className="w-full">
          <input
            type="text"
            placeholder="Busque em suas notas..."
            className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-state-500"
            onChange={handleSearch}
            />
        </form>

        <div className="h-px bg-slate-700" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
          <NewNoteCard onNoteCreated={onNoteCreated} />

          {notes.length !== 0 ? filteredNotes.map((note) => {
            return (
              <NoteCard onNoteDeleted={onNoteDeleted} key={note.id} note={note} />
              );
            }) : <span>Nenhuma nota encontrada</span>}
        </div>
      </div>
    </SignedIn>
    </>
  );
}
