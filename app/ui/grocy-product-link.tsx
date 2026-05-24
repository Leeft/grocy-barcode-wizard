import Grocy from "@/components/icons/grocy";
import { grocyUrl } from "@/lib/grocy";

export default function GrocyProductLink({
  productId,
  children,
}: {
  productId: number;
  children: React.ReactNode;
}) {
  return (
    <div className="static mb-[-16]">
      <a
        href={`${grocyUrl}/product/${productId}`}
        target="_bcw_grocy"
        title="Link to the product in Grocy"
        className="static mb-[-2] inline-flex underline! decoration-dashed underline-offset-3"
      >
        <Grocy className="relative top-0 ml-[-3] w-6 fill-[#4b7daa] stroke-[#467baa] pr-2 pl-0" /> {children}
      </a>
    </div>
  );
}
