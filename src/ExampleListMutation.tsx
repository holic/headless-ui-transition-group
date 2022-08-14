import { useEffect, useRef, useState } from "react";
import { TransitionGroup } from "./TransitionGroup";
import { Transition } from "@headlessui/react";

type Entry = {
  id: number;
  message: string;
};

const useEntries = () => {
  const counterRef = useRef(1);
  const timersRef = useRef<number[]>([]);
  useEffect(() => {
    return () => {
      timersRef.current.map(clearTimeout);
    };
  }, []);

  const [entries, setEntries] = useState<Entry[]>([]);
  const addEntry = (message: string) => {
    const id = counterRef.current++;
    setEntries([...entries, { id, message }]);
    timersRef.current.push(
      setTimeout(() => {
        setEntries((entries) => entries.filter((entry) => entry.id !== id));
      }, 2000)
    );
  };
  return { entries, addEntry };
};

export const ExampleListMutation = () => {
  const { entries, addEntry } = useEntries();

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <button
        type="button"
        className="bg-blue-500 text-white px-[1em] py-[.5em] rounded"
        onClick={() => addEntry("hello tailwind")}
      >
        boop
      </button>
      <TransitionGroup>
        {entries.map(({ id, message }) => (
          <Transition
            key={id}
            show
            enter="transition duration-500"
            enterFrom="-translate-y-4 opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="transition duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="border-2 rounded-lg p-2"
          >
            {message}
          </Transition>
        ))}
      </TransitionGroup>
    </div>
  );
};
