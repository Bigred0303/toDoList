const fetch = require('node-fetch');


const API_KEYS = {
  omdb: 'c7c7e658',
  google: 'AIzaSyC0mekQ2d7JOkB7o1Y_Ht69zFr__pEnd1U',
  yelp: 'XXAFV0sW4Ub5fjwcU_G5A010QDax21TMn9Z5Ub5GJjowb-FsXgFCYKvuCJOzQczhaQNqGvzoxT_z5lVvDr3vpLoLDgeWRM3spiv2klf3xCleDtTfm2Sru2sxvHBrZnYx',
  amazon: '6a4885ad7fmsh6a483f7213abd9ap1c351bjsna8e09a3851e7'
};

// Function to fetch movies from OMDb API
async function fetchOMDbMovies(taskName) {
  const url = `http://www.omdbapi.com/?apikey=${API_KEYS.omdb}&t=${encodeURIComponent(taskName)}`;

  try {
    // Fetch data from OMDb API
    const response = await fetch(url);
    const data = await response.json();
    console.log(data)
    // Process and return relevant data if response is successful
    if (data.Response === 'True') {
      return [{
        movie_title: data.Title,
        release_date: data.Released,
        rating: data.Rated,
        genre: data.Genre,
        imdb_score: parseFloat(data.imdbRating) || 0,
        poster_url: data.Poster
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
    // Fetch data from Google Books API
    const response = await fetch(url);
    const data = await response.json();

    // Process and return relevant data if response is successful
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
    // Fetch data from Yelp API
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEYS.yelp}`
      }
    });
    const data = await response.json();

    // Process and return relevant data if response is successful
    if (data.businesses) {
      return data.businesses.map(business => ({
        restaurant_name: business.name,
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
    // Fetch data from Amazon API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEYS.amazon,
        'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // Process and return relevant data if response is successful
    if (data && data.data && data.data.products && data.data.products.length > 0) {
      return data.data.products.map(product => ({
        name: product.product_title,
        product_name: product.product_title,
        number_of_products: product.product_num_offers || 0,
        lowest_price: product.product_minimum_offer_price ? parseFloat(product.product_minimum_offer_price.replace('$', '')) : 0,
        highest_price: product.product_price ? parseFloat(product.product_price.replace('$', '')) : 0,
        avg_star_rating: product.product_star_rating ? parseFloat(product.product_star_rating) : 0,
        is_prime: product.is_prime || false,
        product_url: product.product_url
      }));
    } else {
      console.warn('No products found in the response data.');
      return [];
    }
  } catch (error) {
    console.error(`Error fetching Amazon products: ${error.message}`);
    return [];
  }
}

module.exports = { fetchOMDbMovies, fetchGoogleBooks, fetchYelpFoods, fetchAmazonProducts };
