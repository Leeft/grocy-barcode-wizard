"use client";

import Select, {
  StylesConfig,
  Props,
  SelectInstance,
  Theme,
  GroupBase,
  OnChangeValue,
} from "react-select";
import { forwardRef, ReactElement, useImperativeHandle, useRef, useState } from "react";
import chroma from "chroma-js";
import { OptionOrGroupArray, OptionType } from "@/interfaces/options";

export interface CustomSelectHandle {
  clear: () => void;
}

export interface ColourOption {
  readonly value: string;
  readonly label: string;
  readonly color: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
}

const themeColors = {
  highlight: "rgb(226, 226, 72)",
  background: "#30384f",
  accent: "#f00",
  borders: "#a0a7c3",
};

/* const dot = (color = "transparent") => ({
  alignItems: "center",
  display: "flex",
});
 */

/* const colors = {
  regular: "#bbb",
  focused: "#00f",
  error: "#fb2c36",
  background: "#024a70",
  backgroundError: "#68352c",
}; */

/* const colourStyles: StylesConfig<ColourOption> = {
  control: (styles, state) => {
    let statusColor = colors.regular;
    let backgroundColor = colors.background;
    const normie = normalizeValue(state.getValue());
    if (
      normie === "" ||
      (Array.isArray(normie) && normie.length > 0 && Number.parseInt(normie[0]) == 0)
    ) {
      if (state.selectProps.required) {
        statusColor = state.isFocused ? "rgb(231, 95, 95)" : colors.error;
        backgroundColor = state.isFocused ? colors.backgroundError : "transparent";
        return {
          ...styles,
          backgroundColor: backgroundColor,
          borderColor: statusColor,
          marginTop: "-2px",
          minHeight: "38px",
          borderWidth: "4px",
          outline: "none",
          boxShadow: "0px",
          borderRadius: "7px",
          placeHolder: "yellow",
        };
      }
    }
    return {
      ...styles,
      backgroundColor: state.isFocused ? "#024a70" : "transparent",
      primary: "yellow",
      marginTop: "-2px",
      minHeight: "38px",
      borderWidth: "4px",
      outline: "none",
      boxShadow: "0px",
      borderRadius: "7px",
    };
  },
  menu: (styles) => ({
    ...styles,
    backgroundColor: chroma("#1d2a3c").brighten(0.5).hex(),
    color: "white",
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(optionColor);
    return {
      ...styles,
      fontWeight: "bold",
      backgroundColor: isDisabled
        ? undefined
        : isSelected
          ? optionColor
          : isFocused
            ? color.alpha(0.3).css()
            : undefined,
      color: isDisabled
        ? "#666"
        : isSelected
          ? chroma.contrast(color, "white") > 2
            ? "white"
            : "black"
          : optionColor,
      cursor: isDisabled ? "not-allowed" : "default",

      ":active": {
        ...styles[":active"],
        backgroundColor: !isDisabled
          ? isSelected
            ? optionColor
            : color.alpha(0.3).css()
          : undefined,
      },
    };
  },
  input: (styles) => ({ ...styles, color: "white", ...dot() }),
  placeholder: (styles) => ({ ...styles, fontWeight: "bold", ...dot("#ccc") }),
  singleValue: (styles, { data }) => ({
    ...styles,
    fontWeight: "bold",
    color: "white",
    ...dot(optionColor),
  }),
}; */

const colourStyles2 = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(): StylesConfig<Option, IsMulti, Group> => ({
  menu: (styles) => ({
    ...styles,
    background: chroma("#213c53").brighten(1.0).hex(),
    border: "1px solid " + chroma("#1d293d").brighten(2).hex(),
  }),
  groupHeading: (styles) => ({
    ...styles,
    color: "#ccc",
  }),
});

const CustomSelectInner = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: Props<Option, IsMulti, Group> & { required?: boolean },
  ref: React.ForwardedRef<CustomSelectHandle>
) => {
  const [stateValue, setStateValue] = useState<OnChangeValue<Option, IsMulti>>(
    (props.value || props.defaultValue || null) as OnChangeValue<Option, IsMulti>
  );
  const [stateInvalid, setStateInvalid] = useState(false);
  const [version, setVersion] = useState(0);

  const refReactSelect = useRef<SelectInstance<Option, IsMulti, Group> | null>(null);

  const onClear = () => {
    // 1. Reset the logic state
    setStateValue(null as OnChangeValue<Option, IsMulti>);
    setStateInvalid(false);

    // 2. Increment version to force the Select component to unmount/remount
    // This clears the visual "stuck" value 100% of the time.
    setVersion((prev) => prev + 1);

    // 3. Notify parent of the change if needed
    if (props.onChange) {
      props.onChange(null as OnChangeValue<Option, IsMulti>, { action: "clear", removedValues: [] });
    }
  };

  // Expose the clear method to the parent via the ref
  useImperativeHandle(ref, () => ({
    clear: onClear,
  }));

  // function customValidity(
  //   value: OptionOrGroupArray | OptionType | null,
  //   modifyInvalidState?: boolean,
  // ) {
  //   const isCurrentlyEmpty =
  //     !value || (Array.isArray(value) && value.length === 0);
  //   if (props.required && isCurrentlyEmpty) {
  //     if (modifyInvalidState) setStateInvalid(true);
  //   } else {
  //     if (modifyInvalidState) setStateInvalid(false);
  //   }
  // }

function customValidity(
    value: OnChangeValue<Option, IsMulti>,
    modifyInvalidState?: boolean
  ) {
    const isCurrentlyEmpty = !value || (Array.isArray(value) && value.length === 0);
    if (props.required && isCurrentlyEmpty) {
      if (modifyInvalidState) setStateInvalid(true);
    } else {
      if (modifyInvalidState) setStateInvalid(false);
    }
  }

  return (
    <div className={`dropdown ${stateInvalid ? "invalid" : ""}`}>
      <Select
        {...props} // Spread all base props
        // CRITICAL: Changing the key forces the DOM to recreate the Select
        key={`custom-select-version-${version}`}
        value={stateValue}
        ref={refReactSelect}
        classNamePrefix="slt"
        styles={colourStyles2<Option, IsMulti, Group>()}
        theme={(theme: Theme) => ({
          ...theme,
          borderRadius: 6,
          colors: {
            ...theme.colors,
            primary: chroma(themeColors.highlight).darken(0.5).hex(), // Focus border
            primary25: chroma(themeColors.highlight).darken(2.0).hex(), // Option selection hover bg
            primary50: chroma(themeColors.accent).darken(3.0).hex(),
            primary75: chroma(themeColors.accent).darken(3.5).hex(),
            neutral0: chroma(themeColors.background).brighten(0).hex(), // Background
            neutral5: chroma(themeColors.background).brighten(0.25).hex(),
            neutral10: chroma(themeColors.background).brighten(0.25).hex(),
            neutral20: chroma(themeColors.borders).brighten(0.0).hex(), // Borders
            neutral30: chroma(themeColors.borders).brighten(1.5).hex(), // Hover border
            neutral40: chroma(themeColors.borders).brighten(1.5).hex(), // Hover caret
            neutral50: chroma(themeColors.background).brighten(1.5).hex(), // Placeholder
            neutral60: chroma(themeColors.background).brighten(3.5).hex(), // Dropdown caret
            neutral70: chroma(themeColors.accent).brighten(0.5).hex(),
            neutral80: chroma(themeColors.background).brighten(3.5).hex(), // Chosen product
            neutral90: chroma(themeColors.accent).brighten(0.5).hex(),
          },
        })}
        onBlur={(event) => {
          if (props.onBlur) props.onBlur(event);
          customValidity(stateValue, true);
        }}
        onChange={(selected, actionMeta) => {
          setStateValue(selected);
          if (props.onChange) {
            props.onChange(selected, actionMeta);
          }
          customValidity(selected, true);
        }}
      />
    </div>
  );
};

// Setting display name for debugging (standard for forwardRef)
CustomSelectInner.displayName = "CustomSelect";

const CustomSelect = forwardRef(CustomSelectInner) as <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: Props<Option, IsMulti, Group> & {
    required?: boolean;
    ref?: React.ForwardedRef<CustomSelectHandle>;
  }
) => ReactElement;

export default CustomSelect;

// export default function CustomSelect<
//   Option,
//   IsMulti extends boolean = false,
//   Group extends GroupBase<Option> = GroupBase<Option>,
// >(props: CustomSelectProps<Option, IsMulti, Group>) {
//   const { /* key */ ...rest } = props;

//   // State hooks
//   const [stateValue, setStateValue] = useState(props.defaultValue);
//   const [stateInvalid, setStateInvalid] = useState(false);

//   // Refs needed for hidden select validity
//   const refReactSelect = useRef<SelectInstance<Option> | null>(null);

//   // useEffect(() => {
//   //   setStateValue(props.value);
//   //   // Run validation if the external value changes to null/empty
//   //   customValidity(props.value, true);
//   // })

//   const onClear = () => {
//     refReactSelect.current?.clearValue();
//     setStateValue(null);
//   };

//   // modifyInvalidState because we don't want to set invalid until onChange
//   function customValidity(
//     value: OptionOrGroupArray | OptionType,
//     modifyInvalidState?: boolean | undefined,
//   ) {
//     modifyInvalidState = modifyInvalidState === true;

//     if (!(refReactSelect && refReactSelect.current)) {
//       return;
//     }

//     if (rest.required && normalizeValue(value) == "") {
//       if (modifyInvalidState && stateInvalid !== true) {
//         setStateInvalid(true);
//       }
//     } else {
//       if (modifyInvalidState && stateInvalid !== false) {
//         setStateInvalid(false);
//       }
//     }
//   }

//   return (
//     <div className={`dropdown${stateInvalid ? "invalid" : ""}`}>
//       <Select
//         // @ts-expect-error: something something typescript
//         ref={refReactSelect}
//         isDisabled={rest.isDisabled}
//         required={rest.required}
//         options={rest.options}
//         isMulti={rest.isMulti}
//         classNamePrefix="slt"
//         defaultValue={rest.defaultValue}
//         // @ts-expect-error: something something typescript
//         styles={colourStyles2}
//         {...rest}

//         onBlur={(event) => {
//           if (props.onChange) {
//             // @ts-expect-error: something something typescript
//             props.onChange.call(this, event);
//           }
//           // @ts-expect-error: something something typescript
//           customValidity(stateValue, true);
//         }}
//         onChange={(selected, { action }) => {
//           if (action === "clear") {
//             onClear();
//           }
//           setStateValue(selected);
//           if (props.onChange) {
//             // @ts-expect-error: something something typescript
//             props.onChange.call(this, selected);
//           }
//           //Run validation
//           // @ts-expect-error: something something typescript
//           customValidity(selected, true);
//         }}
//       ></Select>
//     </div>
//   );
// }

// function normalizeValue(selection: OptionOrGroupArray | OptionType) {
//   if (Array.isArray(selection)) {
//     if (selection.length) {
//       // @ts-expect-error types are not advanced enough
//       return selection.map((keyPair) => keyPair.value);
//     }
//   } else if (selection && typeof selection.value !== typeof undefined) {
//     return selection.value;
//   }
//   return "";
// }
