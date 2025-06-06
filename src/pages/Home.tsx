
import { useState } from 'react';
import { useRecipes, SupabaseRecipe } from '../hooks/useRecipes';
import RecipeCard from '../components/RecipeCard';
import RecipeCardSkeleton from '../components/RecipeCardSkeleton';
import RecipeDetailsPanel from '../components/RecipeDetailsPanel';

// Convert Supabase recipe to legacy format for compatibility
const convertRecipe = (recipe: SupabaseRecipe) => ({
  id: recipe.id,
  name: recipe.name,
  description: recipe.description,
  image: recipe.image,
  rating: recipe.rating,
  reviews: recipe.reviews,
  prices: {
    medium: recipe.medium_price,
    large: recipe.large_price
  },
  ingredients: recipe.ingredients,
  cookingTime: recipe.cooking_time || '',
  spiceLevel: recipe.spice_level
});

const Home = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const { recipes, loading } = useRecipes();

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-coral-900 to-black">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
          Taste of <span className="text-coral-400">Africa</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8 animate-fade-in">
          Experience the authentic taste of perfectly crafted African cuisine, delivered fresh to your doorstep with the magic touch of tradition and love.
        </p>
      </section>

      {/* Recipes Grid */}
      <section id="recipes" className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-white text-center mb-12">
            Home<span className="text-coral-400">Away</span>!
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && recipes.length === 0 ? (
              // Show skeleton loaders only if we have no data at all
              Array.from({ length: 6 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))
            ) : (
              // Show available recipes immediately
              recipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={convertRecipe(recipe)} 
                  onClick={(r) => setSelectedRecipe(r)}
                />
              ))
            )}
            
            {/* Show a few skeleton cards while loading more data if we already have some recipes */}
            {loading && recipes.length > 0 && (
              Array.from({ length: 2 }).map((_, index) => (
                <RecipeCardSkeleton key={`loading-${index}`} />
              ))
            )}
          </div>
          
          {!loading && recipes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No recipes available at the moment.</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for delicious new dishes!</p>
            </div>
          )}
        </div>
      </section>

      {/* Recipe Details Panel */}
      <RecipeDetailsPanel 
        recipe={selectedRecipe!}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
};

export default Home;
