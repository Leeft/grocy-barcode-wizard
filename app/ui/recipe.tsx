import { Product, Recipe as GrocyRecipe } from "@/interfaces/grocy";
import { fetchProduct } from "@/lib/grocy";
import { grocyUrl, baseUrl } from "@/lib/grocy";
import Grocy from "@/components/icons/grocy";
import GrocyProductLink from "@/ui/grocy-product-link";

export default async function Recipe({ recipe }: { recipe: GrocyRecipe }) {
  let createsProduct: Product | undefined = undefined;
  if (recipe.product_id) {
    createsProduct = await fetchProduct(recipe.product_id);
  }

  if (!recipe.id) {
    return (
      <>
        <div className="text-alert">Recipe not found</div>
      </>
    );
  }

  return (
    <>
      <div className={`flex flex-col flex-wrap gap-5`}>
        <h1 className="inline-block text-lg font-bold text-slate-400 uppercase">Recipe: {recipe.name}</h1>
        <dl className="recipe-info">
          <dt>Name</dt>
          <dd>
            <GrocyRecipeLink recipeId={recipe.id}>{recipe.name}</GrocyRecipeLink>
          </dd>
          <dt>Base servings</dt>
          <dd>{recipe.base_servings ? recipe.base_servings : "-"}</dd>
          <dt>Desired servings</dt>
          <dd>{recipe.desired_servings ? recipe.desired_servings : "-"}</dd>
          <dt>Type</dt>
          <dd>{recipe.type}</dd>
          {createsProduct && (
            <>
              <dt>Product</dt>
              <dd>
                <GrocyProductLink productId={createsProduct.id!}>
                  {createsProduct.name}
                  {createsProduct.active !== 1 && (
                    <span className="text-inactive uppercase">&nbsp;&nbsp;[inactive]</span>
                  )}
                </GrocyProductLink>
              </dd>
            </>
          )}
        </dl>

        {recipe.picture_file_name !== null && recipe.picture_file_name && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="my-5 max-w-full rounded-xl md:max-h-100 md:max-w-100"
            alt="Photo of the product"
            src={baseUrl + "/files/recipepictures/" + btoa(recipe.picture_file_name)}
          />
        )}

        {recipe.description !== undefined && (
          <div
            className="recipe-description w-fit"
            dangerouslySetInnerHTML={{ __html: recipe.description }}
          />
        )}
      </div>
    </>
  );
}

function GrocyRecipeLink({ recipeId, children }: { recipeId: number; children: React.ReactNode }) {
  let path = grocyUrl + "recipes";
  path = path.replace(/\/\//g, "/");
  return (
    <div className="static mb-[-16]">
      <a
        href={`${path}?recipe=${encodeURIComponent(recipeId)}`}
        target="_bcw_grocy"
        title="Link to the recipe in Grocy"
        className="static mb-[-2] inline-flex underline! decoration-dashed underline-offset-3"
      >
        <Grocy className="relative top-0 ml-[-3] w-6 fill-[#4b7daa] stroke-[#467baa] pr-2 pl-0" /> {children}
      </a>
    </div>
  );
}
