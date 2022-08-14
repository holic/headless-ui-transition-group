import { ExampleSingleValue } from "./ExampleSingleValue";
import { ExampleListMutation } from "./ExampleListMutation";

const App = () => {
  return (
    <div className="grid grid-cols-4 gap-10 p-10">
      <div className="flex flex-col gap-4">
        Changing a single value:
        <ExampleSingleValue />
      </div>
      <div className="flex flex-col gap-4">
        Adding/removing from a list:
        <ExampleListMutation />
      </div>
    </div>
  );
};

export default App;
