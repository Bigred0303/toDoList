const fetch = require('node-fetch');

const API_KEYS = {
  omdb: 'c7c7e658',
  google: 'AIzaSyC0mekQ2d7JOkB7o1Y_Ht69zFr__pEnd1U',
  yelp: 'XXAFV0sW4Ub5fjwcU_G5A010QDax21TMn9Z5Ub5GJjowb-FsXgFCYKvuCJOzQczhaQNqGvzoxT_z5lVvDr3vpLoLDgeWRM3spiv2klf3xCleDtTfm2Sru2sxvHBrZnYx',
  amazon: '6e89f192f4mshcc8a7dd8ca67541p193534jsn57333207678f'
};

// Function to fetch movies from OMDb API
async function fetchOMDbMovies(taskName) {
  const url = `http://www.omdbapi.com/?apikey=${API_KEYS.omdb}&t=${encodeURIComponent(taskName)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Process and return relevant data
    if (data.Response === 'True') {
      return [{
        name: data.Title,
        release_date: data.Released,
        rating: data.Rated,
        genre: data.Genre,
        imdb_score: parseFloat(data.imdbRating) || 0
      }];
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Error fetching OMDb movies: ${error.message}`);
    return [];
  }
}

// Function to fetch books from Google Books API
async function fetchGoogleBooks(taskName) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(taskName)}&key=${API_KEYS.google}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Process and return relevant data
    if (data.items) {
      return data.items.map(item => ({
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
        publish_date: item.volumeInfo.publishedDate,
        page_count: item.volumeInfo.pageCount || 0,
        purchase_link: item.volumeInfo.previewLink || '',
        price: item.saleInfo.listPrice ? item.saleInfo.listPrice.amount : 0,
        language: item.volumeInfo.language || 'en'
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Error fetching Google Books: ${error.message}`);
    return [];
  }
}

// Function to fetch foods from Yelp API
async function fetchYelpFoods(taskName) {
  const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(taskName)}&location=Saskatoon`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEYS.yelp}`
      }
    });
    const data = await response.json();

    // Process and return relevant data
    if (data.businesses) {
      return data.businesses.map(business => ({
        name: business.name,
        review_count: business.review_count || 0,
        rating: business.rating || 0,
        phone_number: business.phone || '',
        website_url: business.url || '',
        address: business.location.display_address.join(', '),
        category: business.categories.map(cat => cat.title).join(', ')
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Error fetching Yelp foods: ${error.message}`);
    return [];
  }
}

// Function to fetch products from Amazon API
async function fetchAmazonProducts(taskName) {
  const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(taskName)}&page=1&country=US&sort_by=RELEVANCE&product_condition=ALL`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': API_KEYS.amazon,
        'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
      }
    });
    const data = await response.json();

    // Process and return relevant data
    if (data && data.products) {
      return data.products.map(product => ({
        name: product.product_title,
        product_name: product.product_title,
        number_of_products: product.product_num_offers || 0,
        lowest_price: product.product_minimum_offer_price || 0,
        highest_price: product.product_price ? parseFloat(product.product_price.replace('$', '')) : 0,
        avg_star_rating: product.product_star_rating ? parseFloat(product.product_star_rating) : 0,
        is_prime: product.is_prime || false
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Error fetching Amazon products: ${error.message}`);
    return [];
  }
}

module.exports = { fetchOMDbMovies, fetchGoogleBooks, fetchYelpFoods, fetchAmazonProducts };
