import { generateRecipe } from "@/app/actions";
import { inter } from "@/theme";
import { AutoAwesome } from "@mui/icons-material";
import { Box, Button, Paper } from "@mui/material";
import { readStreamableValue } from "ai/rsc";
import MuiMarkdown, { getOverrides } from "mui-markdown";
import { useState } from "react";

const SAMPLE_RECIPE = `
**Peanut Butter and Tomato Pasta Bake**

**Ingredients:**

* 1 cup Pasta
* 1/2 cup Peanut butter
* 1 can Canned tomatoes (diced)
* 1 tsp Garlic powder
* 1 tsp Salt
* 1/2 tsp Pepper
* 1 tbsp Olive oil
* 1 tbsp Sugar

**Steps:**

1. **Preheat the oven**: Preheat the oven to 375°F (190°C).
2. **Cook the pasta**: Cook the pasta according to the package instructions until al dente. Drain and set aside.
3. **Make the sauce**: In a large saucepan, heat the olive oil over medium heat. Add the diced canned tomatoes, garlic powder, salt, and pepper. Stir to combine.
4. **Add peanut butter**: Add the peanut butter to the saucepan and stir until well combined with the tomato mixture.
5. **Add sugar**: Add the sugar to the saucepan and stir to combine.
6. **Combine with pasta**: Add the cooked pasta to the saucepan and stir to combine with the peanut butter and tomato sauce.
7. **Transfer to baking dish**: Transfer the pasta mixture to a baking dish.
8. **Bake**: Bake in the preheated oven for 20-25 minutes, or until the top is lightly browned and the sauce is bubbly.
9. **Serve**: Serve hot and enjoy!

This recipe uses a combination of the available ingredients to create a unique and tasty dish. The peanut butter adds a rich and creamy element, while the canned tomatoes provide a burst of flavor. The garlic powder and pepper add a savory touch, and the sugar balances out the flavors. This recipe is perfect for a quick and easy dinner or lunch.
`.trim(); 

const RecipeGenerator = () => {
  const [recipe, setRecipe] = useState<string>('');

  const handleGenerateRecipe = async () => {
    const result = await generateRecipe();

    for await (const content of readStreamableValue(result)) {
      setRecipe(content as string);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
      <Button startIcon={<AutoAwesome />} onClick={handleGenerateRecipe} variant="contained" color="primary">
        Generate Recipe
      </Button>
      <Box sx={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'start', width: '100%' }}>
        {
          recipe ? (
            <Paper sx={{ marginTop: '1rem', marginBottom: '2rem', padding: '2rem', borderRadius: 3 }}>
              <MuiMarkdown
                overrides={{
                  ...getOverrides(), // This will keep the other default overrides
                  h3: {
                    props: {
                      style: {
                        fontFamily: inter.style.fontFamily,
                        fontSize: '1.5rem',
                        paddingBottom: '1.5rem',
                      }
                    } as React.HTMLProps<HTMLHeadingElement>,
                  },
                  p: {
                    props: {
                      style: {
                        fontFamily: inter.style.fontFamily,
                        paddingBottom: '0.5rem',
                      }
                    } as React.HTMLProps<HTMLParagraphElement>,
                  },
                  ol: {
                    props: {
                      style: {
                        fontFamily: inter.style.fontFamily,
                        paddingLeft: '1.5rem',
                        paddingBottom: '0.75rem',
                      }
                    } as React.HTMLProps<HTMLOListElement>,
                  },
                  ul: {
                    props: {
                      style: {
                        fontFamily: inter.style.fontFamily,
                        paddingLeft: '1.5rem',
                        paddingBottom: '0.75rem',
                      }
                    } as React.HTMLProps<HTMLUListElement>,
                  },
                  li: {
                    props: {
                      style: {
                        fontFamily: inter.style.fontFamily,
                        paddingBottom: '0.5rem',
                      }
                    } as React.HTMLProps<HTMLLIElement>,
                  },
                }}              
              >
                {`### ${recipe}`}	
              </MuiMarkdown>
            </Paper>
          ) : null
        }
      </Box>
    </Box>
  );
};

export default RecipeGenerator;