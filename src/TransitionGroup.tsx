import React, { useRef } from "react";
import { Transition } from "@headlessui/react";

type ComponentKey = string | number;

function getChildKey(child: React.ReactElement<any>): ComponentKey {
  return child.key || "";
}

function updateChildLookup(
  children: React.ReactElement<any>[],
  allChildren: Map<ComponentKey, React.ReactElement<any>>
) {
  const seenChildren = import.meta.env.DEV ? new Set<ComponentKey>() : null;

  children.forEach((child) => {
    const key = getChildKey(child);

    if (import.meta.env.DEV && seenChildren) {
      if (seenChildren.has(key)) {
        console.error(
          `Children of \`TransitionGroup\` require unique keys. Key "${key}" is a duplicate.`
        );
      }

      seenChildren.add(key);
    }

    allChildren.set(key, child);
  });
}

function useForceUpdate(): () => void {
  return React.useReducer(() => ({}), {})[1];
}

function onlyElements(children: React.ReactNode): React.ReactElement<any>[] {
  const filtered: React.ReactElement<any>[] = [];

  // We use forEach here instead of map as map mutates the component key by preprending `.$`
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === Transition) {
      filtered.push(child);
    }
  });

  return filtered;
}

type Props = {
  children: React.ReactNode;
  exitBeforeEnter?: boolean;
};

export const TransitionGroup = ({ children, exitBeforeEnter }: Props) => {
  const forceRender = useForceUpdate();

  const isInitialRender = useRef(true);

  // Filter out any children that aren't ReactElements. We can only track ReactElements with a props.key
  const filteredChildren = onlyElements(children);

  // Keep a living record of the children we're actually rendering so we
  // can diff to figure out which are entering and exiting
  const presentChildren = useRef(filteredChildren);

  // A lookup table to quickly reference components by key
  const allChildren = useRef(
    new Map<ComponentKey, React.ReactElement<any>>()
  ).current;

  // A living record of all currently exiting components.
  const exiting = useRef(new Set<ComponentKey>()).current;

  updateChildLookup(filteredChildren, allChildren);

  // If this is the initial component render, just deal with logic surrounding whether
  // we play onMount animations or not.
  if (isInitialRender.current) {
    isInitialRender.current = false;

    return (
      <>
        {filteredChildren.map((child) =>
          React.cloneElement(child, {
            key: getChildKey(child),
            show: true,
            appear: true,
          })
        )}
      </>
    );
  }

  // If this is a subsequent render, deal with entering and exiting children
  let childrenToRender = [...filteredChildren];

  // Diff the keys of the currently-present and target children to update our
  // exiting list.
  const presentKeys = presentChildren.current.map(getChildKey);
  const targetKeys = filteredChildren.map(getChildKey);

  // Diff the present children with our target children and mark those that are exiting
  const numPresent = presentKeys.length;
  for (let i = 0; i < numPresent; i++) {
    const key = presentKeys[i];
    if (targetKeys.indexOf(key) === -1) {
      exiting.add(key);
    } else {
      // In case this key has re-entered, remove from the exiting list
      exiting.delete(key);
    }
  }

  // If we currently have exiting children, and we're deferring rendering incoming children
  // until after all current children have exiting, empty the childrenToRender array
  if (exitBeforeEnter && exiting.size) {
    childrenToRender = [];
  }

  // Loop through all currently exiting components and clone them to overwrite `animate`
  // with any `exit` prop they might have defined.
  exiting.forEach((key) => {
    // If this component is actually entering again, early return
    if (targetKeys.indexOf(key) !== -1) return;

    const child = allChildren.get(key);
    if (!child) return;

    const insertionIndex = presentKeys.indexOf(key);

    const onExit = () => {
      allChildren.delete(key);
      exiting.delete(key);

      // Remove this child from the present children
      const removeIndex = presentChildren.current.findIndex(
        (presentChild) => presentChild.key === key
      );
      presentChildren.current.splice(removeIndex, 1);

      // Defer re-rendering until all exiting children have indeed left
      if (!exiting.size) {
        presentChildren.current = filteredChildren;
        forceRender();
        // onExitComplete && onExitComplete();
      }
    };

    childrenToRender.splice(
      insertionIndex,
      0,
      React.cloneElement(child, {
        key: getChildKey(child),
        show: false,
        appear: true,
        afterLeave: onExit,
      })
    );
  });

  childrenToRender = childrenToRender.map((child) => {
    const key = getChildKey(child);
    return exiting.has(key)
      ? child
      : React.cloneElement(child, {
          key: getChildKey(child),
          show: true,
          appear: true,
        });
  });

  presentChildren.current = childrenToRender;

  if (import.meta.env.DEV && exitBeforeEnter && childrenToRender.length > 1) {
    console.error(
      `You're attempting to animate multiple children within \`TransitionGroup\`, but its \`exitBeforeEnter\` prop is set to \`true\`. This will lead to odd visual behaviour.`
    );
  }

  return <>{childrenToRender}</>;
};
