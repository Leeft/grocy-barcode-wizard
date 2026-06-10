"use client";

import { Recipe as GrocyRecipe, Servings } from "@/interfaces/grocy";
import { setServings } from "./recipe";
import { ChangeEvent } from "react";
import { inputCommonStyles } from "@/lib/product-form-shared";

export function RecipeServings({ code, recipe }: { code: string; recipe: GrocyRecipe }) {
  return (
    <input
      className={inputCommonStyles}
      type="number"
      name="desired_servings"
      min={1}
      max={10}
      step={1}
      id="desired_servings"
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        setServings(code, recipe.id, e.currentTarget.value as Servings)
      }
      defaultValue={recipe.desired_servings ? recipe.desired_servings : ""}
    />
  );
}
