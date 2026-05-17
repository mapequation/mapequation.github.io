import { Field, Input, InputGroup } from "@chakra-ui/react";
import {
  type ComponentProps,
  type FC,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import useStore from "../../state";

type InputParametersProps = ComponentProps<typeof Field.Root> & {
  loading?: boolean;
  onClick: () => void;
};

const FieldErrorText = Field.ErrorText as FC<{ children: ReactNode }>;

export default function InputParameters({
  loading,
  onClick,
  ...props
}: InputParametersProps) {
  const store = useStore();
  const { args, setArgs, argsError, hasArgsError } = store.params;
  const [args_, setArgs_] = useState(args);

  useEffect(() => {
    const timer = setTimeout(() => setArgs(args_), 200);
    return () => clearTimeout(timer);
  }, [args_, setArgs]);

  useEffect(() => setArgs_(args), [args]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      <Field.Root invalid={hasArgsError} {...props}>
        <InputGroup startAddon="CLI">
          <Input
            aria-label="Infomap parameters"
            name="infomap-parameters"
            placeholder="Add parameters…"
            textStyle="code"
            fontSize={12}
            value={args_}
            borderColor={hasArgsError ? "red.600" : undefined}
            _focus={{ borderColor: hasArgsError ? "red.600" : undefined }}
            onChange={(event) => setArgs_(event.target.value)}
            borderRadius="md"
            size="sm"
            bg="white"
          />
        </InputGroup>
        <FieldErrorText>{argsError}</FieldErrorText>
      </Field.Root>
    </form>
  );
}
