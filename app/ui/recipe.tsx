"use server";

import { Product, Recipe as GrocyRecipe, Ingredient, QuantityUnit, Servings } from "@/interfaces/grocy";
import {
  fetchAllQuantityUnitConversionsResolved,
  fetchConfig,
  fetchProduct,
  fetchProducts,
  fetchQuantityUnits,
  setRecipeServings,
  grocyUrl,
  baseUrl,
} from "@/lib/grocy";
import Grocy from "@/components/icons/grocy";
import GrocyProductLink from "@/ui/grocy-product-link";
import { formatMoney, formatNumber, toLookup } from "@/lib/utils";
import { Check, TriangleAlert, X } from "lucide-react";
import { RecipeServings } from "./recipe-servings";
import { revalidatePath } from "next/cache";

export const setServings = async (code: string, recipeId: number, servings: Servings) => {
  "use server";
  await setRecipeServings({ recipeId: recipeId, servings: servings });
  revalidatePath(`/scan/[barcode]`, "page");
};

export default async function Recipe({
  code,
  recipe,
  ingredients,
}: {
  code: string;
  recipe: GrocyRecipe;
  ingredients: Ingredient[];
}) {
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

  const groupedIngredients: Record<string, Ingredient[]> = {};

  ingredients.map((ingredient) => {
    let group = "_";
    if (ingredient.ingredient_group !== null) {
      group = ingredient.ingredient_group;
    }
    if (groupedIngredients[group] === undefined) {
      groupedIngredients[group] = [];
    }
    groupedIngredients[group]!.push(ingredient);
  });

  const groups = Object.keys(groupedIngredients);

  const products: Product[] = await fetchProducts();
  const productMap = toLookup(products);
  const units: QuantityUnit[] = await fetchQuantityUnits();
  const unitsMap = toLookup(units);
  const grocyConfig = await fetchConfig();
  const quResolved = await fetchAllQuantityUnitConversionsResolved();

  const energy = ingredients.reduce(
    (energy: number, ingredient: Ingredient) => ingredient.calories + energy,
    0,
  );

  const cost = ingredients.reduce((cost: number, ingredient: Ingredient) => ingredient.costs + cost, 0);

  return (
    <>
      <div className={`flex flex-col flex-wrap gap-5`}>
        <h1 className="inline-block text-lg font-bold text-slate-400 uppercase">Recipe: {recipe.name}</h1>
        <dl className="recipe-info">
          <dt>Name</dt>
          <dd>
            <GrocyRecipeLink recipeId={recipe.id}>{recipe.name}</GrocyRecipeLink>
          </dd>
          <dt>Type</dt>
          <dd>{recipe.type}</dd>
          <dt>Energy</dt>
          <dd>
            {formatNumber(Math.round(energy), grocyConfig)} {grocyConfig.ENERGY_UNIT} per serving
          </dd>
          <dt>Cost</dt>
          <dd>
            {grocyConfig.CURRENCY} {formatMoney(cost, grocyConfig)}
          </dd>
          <dt>Base servings</dt>
          <dd>{recipe.base_servings ? recipe.base_servings : "-"}</dd>
          <dt>Desired servings</dt>
          <dd>
            <RecipeServings code={code} recipe={recipe} />
          </dd>
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

        {ingredients.length > 0 && (
          <>
            <h2 className="text-md inline-block font-bold text-slate-400 uppercase">Ingredients</h2>

            {groups.map((group) => (
              <div key={`group-${group}`} className="my-0 py-0">
                {group !== "_" && (
                  <h3 className="mb-3 inline-block text-sm font-bold text-slate-400">{group}</h3>
                )}

                <div key={group} className="flex flex-col gap-3">
                  {groupedIngredients[group]?.map((ingredient) => {
                    let textClass = "";
                    switch (ingredient.due_score) {
                      case 20:
                        textClass = "text-ingredient-danger";
                        break;
                      case 10:
                        textClass = "text-ingredient-alert";
                        break;
                      case 1:
                        textClass = "text-ingredient-warning";
                        break;
                    }

                    let amount = ingredient.recipe_amount;

                    const product = productMap[ingredient.product_id];

                    if (product !== undefined && ingredient.only_check_single_unit_in_stock === 0) {
                      const conversion = quResolved
                        .filter((conv) => conv.product_id === ingredient.product_id)
                        .filter((conv) => conv.from_qu_id === product.qu_id_stock)
                        .find((conv) => conv.to_qu_id === ingredient.qu_id);
                      if (conversion !== undefined) {
                        amount *= conversion.factor;
                      }
                    } else {
                      console.log("Did not get product for", ingredient);
                    }

                    if (ingredient.recipe_variable_amount) {
                      amount = ingredient.recipe_variable_amount;
                    }

                    if (product === undefined) return <></>;

                    return (
                      <div key={`${group}-${ingredient.recipe_pos_id}`} className="flex flex-row gap-x-3">
                        <div className={`max-w-100 shrink grow ${textClass}`}>
                          {!product!.active && (
                            <div className="text-xs text-gray-400 italic">
                              Disabled
                              <br />
                            </div>
                          )}
                          {ingredient.recipe_variable_amount ? (
                            <>{ingredient.recipe_variable_amount}</>
                          ) : (
                            <>
                              {formatNumber(amount, grocyConfig)}{" "}
                              {amount !== 1
                                ? unitsMap[ingredient.qu_id]!.name_plural
                                : unitsMap[ingredient.qu_id]!.name}{" "}
                            </>
                          )}
                          {ingredient.product_name}

                          {grocyConfig && grocyConfig.FEATURE_FLAG_STOCK && (
                            <span className="text-xs">
                              <>
                                {ingredient.need_fulfilled === 1 ? (
                                  <>
                                    <Check size={18} className="text-ingredient-success mx-1 inline" />
                                  </>
                                ) : (
                                  <>
                                    {ingredient.need_fulfilled_with_shopping_list === 1 ? (
                                      <TriangleAlert
                                        size={18}
                                        className="text-ingredient-warning mx-1 inline"
                                      />
                                    ) : (
                                      <X size={18} className="text-ingredient-danger mx-1 inline" />
                                    )}
                                  </>
                                )}
                              </>
                              <>
                                {ingredient.need_fulfilled === 1 ? (
                                  <>
                                    Enough in stock ({formatNumber(ingredient.stock_amount, grocyConfig)}{" "}
                                    {ingredient.stock_amount !== 1
                                      ? unitsMap[product.qu_id_stock ?? 0]!.name_plural
                                      : unitsMap[product.qu_id_stock ?? 0]!.name}
                                    )
                                  </>
                                ) : (
                                  <>
                                    Not enough in stock,{" "}
                                    {formatNumber(ingredient.missing_amount, grocyConfig)} missing,{" "}
                                    {ingredient.amount_on_shopping_list} already on shopping list
                                  </>
                                )}
                              </>
                            </span>
                          )}
                        </div>

                        <div className="max-w-60 shrink text-right italic">
                          {!product!.active && <br />}
                          {ingredient.calories !== 0 ? formatNumber(Math.round(ingredient.calories), grocyConfig) : '?'}&nbsp;
                          {grocyConfig && grocyConfig.ENERGY_UNIT ? grocyConfig.ENERGY_UNIT : "??"}
                          {", "}
                          {grocyConfig && grocyConfig.CURRENCY ? grocyConfig.CURRENCY : "??"}&nbsp;
                          {formatMoney(ingredient.costs, grocyConfig)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {recipe.description !== undefined && (
          <>
            <h2 className="text-md mt-4 inline-block font-bold text-slate-400 uppercase">Description</h2>
            <div
              className="recipe-description w-xl"
              dangerouslySetInnerHTML={{ __html: recipe.description }}
            />
          </>
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
