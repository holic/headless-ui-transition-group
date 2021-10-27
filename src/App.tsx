import { useState } from "react";
import { TransitionGroup } from "./TransitionGroup";
import { Transition } from "@headlessui/react";

const App = () => {
  const [counter, setCounter] = useState(1);
  const message = `hello tailwind #${counter}`;
  return (
    <div className="flex flex-col gap justify-center items-center gap-4 p-10">
      <TransitionGroup exitBeforeEnter>
        <Transition
          key={message}
          show
          enter="transition duration-500"
          enterFrom="translate-y-4 opacity-0"
          enterTo="translate-y-0 opacity-100"
          leave="transition duration-500"
          leaveFrom="translate-y-0 opacity-100"
          leaveTo="-translate-y-4 opacity-0"
          className="border-2 rounded-lg p-2"
        >
          {message}
        </Transition>
      </TransitionGroup>
      <button
        type="button"
        className="bg-blue-500 text-white px-[1em] py-[.5em] rounded"
        onClick={() => setCounter(counter + 1)}
      >
        boop
      </button>
    </div>
  );
};

export default App;
