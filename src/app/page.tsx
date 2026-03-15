import { LocationsDropdown } from "./components/locations-dropdown";
import { ProductgroupsDropdown } from "./components/productgroups-dropdown";

export default function Page() {
  return (
    <div>
      <h1>Hello Next.js!</h1>
      <div className="p-5">
        <LocationsDropdown selectedIndex={8} />
      </div>
      <div className="p-5">
        <ProductgroupsDropdown selectedIndex={5} />
      </div>
    </div>
  );
}
