import { CSSObjectWithLabel } from "react-select";

// // valueContainer:
//         container: (baseStyles, state) => ({
//           ...baseStyles,
//           textColor: 'yellow'
//         }),
//         control: (baseStyles, state) => ({
//           ...baseStyles,
//           //borderColor: state.isFocused ? 'grey' : 'red',
//           input: 'bg-slate-500',
//           menu: 'text-red-500',
//         }),
//       }}

export default {
  dropdownIndicator: (base: CSSObjectWithLabel) => ({
    ...base,
    background: "#354a68",
  }),
  container: (base: CSSObjectWithLabel) => ({
    ...base,
  }),
  menuList: (base: CSSObjectWithLabel) => ({
    ...base,
    height: "100%",
    background: "rgb(82, 112, 154)",
    color: "black",
  }),
  loadingMessage: (base: CSSObjectWithLabel) => ({
    ...base,
    background: "#1e2939",
    color: "#ddd",
  }),
  loadingIndicator: (base: CSSObjectWithLabel) => ({
    ...base,
    background: "transparent",
    color: "#ddd",
  }),
  valueContainer: (base: CSSObjectWithLabel) => ({
    ...base,
    height: "100%",
    //background: 'rgb(82, 112, 154)',
    background: "#1e2939",
    color: "#ddd",
    fontWeight: "bold",
  }),
  placeholder: (base: CSSObjectWithLabel) => ({
    ...base,
    color: "#ddd",
    fontWeight: "bold",
  }),
  singleValue: (base: CSSObjectWithLabel) => ({
    ...base,
    color: "#ddd",
    background: "#1e2939",
    fontWeight: "bold",
  }),
};
