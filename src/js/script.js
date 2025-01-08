/*
    JS Script
    -Rodrigo Moreno Bielsa

*/


// Movile Menu:

const menuButton = document.getElementById("menu-button");
const mobileMenu = document.getElementById("mobile-menu");

menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
});


// Asociar ids del HTML
const buscarInput = document.getElementById("input");
const buscarBtn = document.getElementById("btnbuscar");
const titulo = document.getElementById("titulo");
const fecha = document.getElementById("fecha");
const rating = document.getElementById("rating");
const descripcion = document.getElementById("descripcion");
const img = document.getElementById("img");
const mensajeError = document.getElementById("mensaje-error");

/* ################################
   ##     TVmaze API Section     ##
   ################################
*/

// TVmaze API (Public)
// URL: https://api.tvmaze.com/singlesearch/shows?q=friends

// Función para cargar datos de la API de TVmaze
const cargarSeries = () => {

    // Usar el valor del input del DOM
    const serieQuery = buscarInput.value.trim();

    // Si el input está vacio
    if (!serieQuery) {
        mensajeError.textContent = "Por favor, introduce el nombre de una serie.";
        return;
    }

    // Buscar las series en la API  
    // encodeURIComponent adecua la búsqueda a la URL
    fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(serieQuery)}`)
        .then(response => response.json())
        .then(data => {

            // Si no se encuentra
            if (data.length === 0 || !data[0].show) {
                mensajeError.textContent = "No se encontraron resultados para esa serie.";
                console.log("No se encontraron resultados para esa serie.")
                return;
            }
            // Si se encuentra
            const showData = data[0].show;
            const serie = new Serie(
                showData.id,
                showData.name,
                showData.image,
                showData.premiered,
                showData.rating,
                showData.summary
            );
            // Borrar la busqeuda anterior
            serie.mostrarEnDOM("serie-info", true);
        })
        //En caso de error
        .catch(error => {
            console.error("Error al buscar la serie: ", error);
            mensajeError.textContent = "No se pudieron obtener los datos.";
        });
};

// Botón para cargar las series y actualizar el historial
buscarBtn.addEventListener("click", () => {
    const serieQuery = buscarInput.value.trim();
    if (serieQuery) {
        cargarSeries();
        guardarHistorialDeBusqueda(serieQuery);
    } 
    if (!serieQuery) {
        mensajeError.textContent = "Por favor, introduce el nombre de una serie.";
    }
});


// Función para mostrar series en el DOM
const mostrarSeries = (show) => {
    console.log(`Nombre: ${show.name}`);
    console.log(`Géneros: ${show.genres.join(", ")}`);
    console.log(`Idioma: ${show.language}`);
    console.log(`Resumen: ${show.summary}`); 

    titulo.textContent = show.name;
    fecha.textContent = show.premiered || "No disponible";
    rating.textContent = show.rating.average || "No disponible";
    descripcion.textContent = show.summary || "No disponible";

    // Portada de la serie
    const img = document.getElementById('img');
    if (show.image) {
        img.src = show.image.medium;
        img.alt = `Imagen de ${show.name}`;
        img.classList.remove("hidden");
    }
    if (!show.image) {
        // Ocultar la imagen si no hay datos
        img.classList.add("hidden");
    }
};



/* ################################
   ##     TVmaze API Section     ##
   ################################
*/

// TMDB API (Private)
// URL: https://api.themoviedb.org/3/search/tv?query=friends&api_key=d64bf1ae52757a8b3651e8c283ae6cfc

// API key para TMDB
const apiKey = "d64bf1ae52757a8b3651e8c283ae6cfc";

// Función para cargar datos de TMDB y buscar series similares
const cargarApiTMDB = () => {

    // Usar el valor del input del DOM
    const serie = buscarInput.value.trim();

    // Si el input está vacio
    if (serie === "") {
        mensajeError.textContent = "Por favor, introduce el nombre de una serie.";
    }

    // Buscar las series en la API  
    // encodeURIComponent adecua la búsqueda a la URL
    fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(serie)}&api_key=${apiKey}`)
    .then(response => response.json()) 
    .then(data => {
        
        // Si no se encuentra
        if (!data.results.length) {
            mensajeError.textContent = "Serie no encontrada en TMDB.";
            console.log("Serie no encontrada en TMDB.");
            return;
        }

        // Si se encuentra
        mensajeError.textContent = "";
        mostrarSerieTMDB(data.results[0]);
        cargarSeriesSimilares(data.results[0].id);
    })
    //En caso de error
    .catch(error => {
        console.error("Hubo un error al obtener los datos de TMDB: ", error);
        mensajeError.textContent = "Hubo un error al obtener los datos de TMDB.";
    });

};

// Función para mostrar los datos de serie buscada
const mostrarSerieTMDB = (serieInfo) => {
    // Mostrar los resultados en el DOM 
    /*  No es necesario pues se usan ambas APIS para los mismos resultados
     titulo.textContent = serieInfo.name || "No disponible";
     fecha.textContent = `Fecha de lanzamiento: ${serieInfo.first_air_date || "No disponible"}`;
     rating.textContent = `Rating: ${serieInfo.vote_average || "No disponible"}`;
     descripcion.textContent = serieInfo.overview || "No disponible";
     img.alt = serieInfo.name || "No disponible";
     */
};


// Mostrar las series según el año de su salida (1989 - 2014)

// Asociar elementos del DOM 
const yearInput = document.getElementById("yearInput");
const yearSearchBtn = document.getElementById("yearSearchBtn");
const yearSearchResults = document.getElementById("year-search-results");

// Función para cargar series por año
const searchSeriesByYear = () => {

    // Usar el valor del input del DOM
    const year = yearInput.value.trim();

    // Si el input está vacio
    if (year === "") {
        mensajeError.textContent = "Por favor, introduce un año válido.";
    }

    const yearSearchResults = document.getElementById("year-search-results");
    // Borrar los resultados anteriores
    yearSearchResults.innerHTML = "";
 
    // Buscar en TVmaze
    fetch(`https://api.tvmaze.com/shows?q=${encodeURIComponent(year)}`)
        .then(response => response.json())
        .then(data => {

            // Si no se encontraron 
            if (data.length === 0) {
                mensajeError.textContent = "No se encontraron series para ese año.";
                return;
            }

            // Mostrar todos los datos de series encontradas
            data.forEach(show => {
                if (show.premiered && show.premiered.startsWith(year)) {
                    const serie = new Serie(show.id, show.name, show.image, show.premiered, show.rating, show.summary);
                    serie.mostrarEnDOM("year-search-results");
                }
            });
        })
        // En caso de error
        .catch(error => {
            console.error("Error al buscar series por año: ", error);
            mensajeError.textContent = "Error al buscar series por año.";
        });
};


// Botón para series por año de salida
yearSearchBtn.addEventListener("click", searchSeriesByYear);


// Mostrar las series según su nota

// Asociar elementos del DOM 
const ratingInput = document.getElementById("ratingInput");
const ratingSearchBtn = document.getElementById("ratingSearchBtn");
const ratingSearchResults = document.getElementById("rating-search-results");

// Función para cargar series por nota
const searchSeriesByRating = () => {

    // Usar el valor del input del DOM
    const rating = ratingInput.value.trim();

    // Si el input está vacio
    if (rating === "") {
        mensajeError.textContent = "Por favor, introduce una nota.";
    }

    // Redondear para abajo
    fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&vote_average.gte=${rating}&vote_average.lte=${parseFloat(rating) + 0.9}`)
        .then(response => response.json())
        .then(data => {
            const ratingSearchResults = document.getElementById("rating-search-results");
            // Borrar los resultados anteriores
            ratingSearchResults.innerHTML = "";

            // Si no se encontraron 
            if (data.results.length === 0) {
                mensajeError.textContent = "No se encontraron series con esa valoración.";
                return;
            }

            // Mostrar todos los datos de series encontradas
            data.results.forEach(show => {
                const serie = new Serie(show.id, show.name, show.poster_path, show.first_air_date, { average: show.vote_average }, show.overview);
                serie.mostrarEnDOM("rating-search-results");
            });
        })
        // En caso de error
        .catch(error => {
            console.error("Error al buscar series por valoración: ", error);
            mensajeError.textContent = "Error al buscar series por valoración.";
        });
};


//Botón para las series según la nota
ratingSearchBtn.addEventListener("click", searchSeriesByRating);


// Buscar series similares

// Función para cargar las series similares a la buscada
const cargarSeriesSimilares = (serieId) => {
    fetch(`https://api.themoviedb.org/3/tv/${serieId}/similar?api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const similarSeries = document.getElementById("similar-series");
            // Borrar los resultados previos
            similarSeries.innerHTML = "";
            // Mostrar las series
            data.results.forEach(show => {
                const serie = new Serie(show.id, show.name, show.poster_path, show.first_air_date, { average: show.vote_average }, show.overview);
                serie.mostrarEnDOM("similar-series");
            });
        })
        //  En caso de error
        .catch(error => {
            console.error("Error al cargar series similares: ", error);
            mensajeError.textContent = "Error al cargar series similares.";
        });
};


// Botón de buscar series
buscarBtn.addEventListener("click", cargarApiTMDB);


/* ######################################
   ##  Mostrar las tarjetas de Series  ##
   ######################################
*/

// Función para mostrar las series en el DOM
const mostrarTarjetasDeSeries = (series, contenedorId) => {
    const contenedor = document.getElementById(contenedorId);
    
    // Borrar el contenido anterior
    contenedor.textContent = "";

    series.forEach(serie => {
        // Crear y mostrar tarjeta
        const serieDiv = document.createElement("div");
        serieDiv.className = "p-4 shadow-lg rounded-lg";

        // Crear y mostrar la portada
        const img = document.createElement("img");
        img.className = "mb-4";
        img.alt = serie.name || "Sin título";
        img.src = serie.poster_path ? `https://image.tmdb.org/t/p/w300${serie.poster_path}` : "path/to/default/image.jpg"; // Se puede configurar una imagen por defecto
        serieDiv.appendChild(img);

        // Crear y mostrar el titulo
        const h3 = document.createElement("h3");
        h3.textContent = serie.name;
        h3.className = "text-lg font-bold";
        serieDiv.appendChild(h3);

        // Crear y mostrar la descripción
        const p = document.createElement("p");
        p.textContent = serie.overview || "Sin descripción.";
        serieDiv.appendChild(p);

        contenedor.appendChild(serieDiv);
    });
}


/* ######################################
   ##  LocalStorage para el historial  ##
   ######################################
*/

// Función para guardar el historial de series
const guardarHistorialDeBusqueda = (busqueda) => {

    // Para guardarlo dentro de localStorage
    let historial = JSON.parse(localStorage.getItem('historialDeBusquedas')) || [];
    
    // Si ya está incluida la busqueda en el historial
    if (!historial.includes(busqueda)) {
        historial = [busqueda, ...historial];
        // Máximo de 9 búsquedas en el historial
        while (historial.length > 9) {
            // Elimina la última búsqueda
            historial.pop();
        }
        localStorage.setItem("historialDeBusquedas", JSON.stringify(historial));
        // Actualizar el historial
        mostrarHistorialDeBusqueda();
    }
};


// Función para mostrar el historial en el DOM
const mostrarHistorialDeBusqueda = () => {
    const contenedorHistorial = document.getElementById("historial-busquedas");
    const historial = JSON.parse(localStorage.getItem("historialDeBusquedas")) || [];

    // Limpiarlo antes de añadir más
    contenedorHistorial.innerHTML = ""; 

    // Mostrar el historial
    historial.forEach(busqueda => {
        const boton = document.createElement("button");
        boton.textContent = busqueda;
        boton.className = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2";
        boton.addEventListener("click", () => realizarBusquedaDesdeHistorial(busqueda));
        contenedorHistorial.appendChild(boton);
    });
};


// Función para mostrar las series del historial
const realizarBusquedaDesdeHistorial = (busqueda) => {
    buscarInput.value = busqueda;
    cargarSeries();
};

// Mostrar el historial al cargar la página
document.addEventListener('DOMContentLoaded', mostrarHistorialDeBusqueda);

// Eliminar el localStorage
// localStorage.clear();


/* ####################################
   ##  Convertir Series en Objetos   ##
   ####################################
*/

// Clase "Serie"
class Serie {
    constructor(id, name, image, premiered, rating, summary) {
        this.id = id;
        this.name = name;
        this.image = (image && (image.medium || `https://image.tmdb.org/t/p/w300${image}`)) || "../path/to/default/image.jpg";
        this.premiered = premiered;
        this.rating = rating;
        this.summary = summary;
    }

    get displayName() {
        return this.name;
    }

    get displayImage() {
        return this.image;
    }

    get displayPremiered() {
        return this.premiered || "No disponible";
    }

    get displayRating() {
        return this.rating ? this.rating.average : "No disponible";
    }

    get displaySummary() {
        return this.summary || "No disponible";
    }

    // Método para mostrar tarjetas con las series resultados
    mostrarEnDOM(contenedorId, clearContainer = false) {
        const contenedor = document.getElementById(contenedorId);

        // Borrar los resultados anteriores si fuese necesario
        if (clearContainer) {
            contenedor.innerHTML = "";
        }

        // Crear y mostrar tarjetas
        const card = document.createElement("div");
        card.className = "p-4 shadow-lg rounded-lg";

        // Crear y mostrar imagenes
        const img = document.createElement("img");
        img.src = this.displayImage;
        img.alt = `Imagen de ${this.name}`;
        img.className = "mb-4";
        card.appendChild(img);

        // Crear y mostrar titulos
        const titulo = document.createElement("h3");
        titulo.textContent = this.displayName;
        titulo.className = "text-lg font-bold";
        card.appendChild(titulo);

        // Crear y mostrar fecha
        const fecha = document.createElement("p");
        fecha.textContent = `Estrenada: ${this.displayPremiered}`;
        card.appendChild(fecha);

        // Crear y mostrar nota
        const rating = document.createElement("p");
        rating.textContent = `Rating: ${this.displayRating}`;
        card.appendChild(rating);

        // Crear y mostrar descripción
        const descripcion = document.createElement("p");
        descripcion.innerHTML = this.displaySummary;
        card.appendChild(descripcion);

        contenedor.appendChild(card);
    }
}

/* ####################################
   ##    Validación de los inputs    ##
   ####################################
*/

// Validación para buscar por año
document.getElementById("yearSearchBtn").addEventListener("click", () => {
    // Asociar elementos del DOM 
    const yearInput = document.getElementById("yearInput");
    const year = parseInt(yearInput.value);
    const yearError = document.getElementById("yearError");

    // Condición de errores
    if (!year || year < 1989 || year > 2014) {
        yearError.textContent = "Por favor, introduce un año válido entre 1989 y 2014.";
    }
    if (year >= 1989 && year <= 2014) {
        yearError.textContent = "";
    }
});

// Validación para buscar por nota
document.getElementById("ratingSearchBtn").addEventListener("click", () => {
    // Asociar elementos del DOM 
    const ratingInput = document.getElementById("ratingInput");
    const rating = parseFloat(ratingInput.value);
    const ratingError = document.getElementById("ratingError");

    // Condición de errores
    if (!rating || rating < 0 || rating > 10) {
        ratingError.textContent = "Por favor, introduce una valoración válida entre 0 y 10.";
    }
    if (rating >= 0 && rating <= 10) {
        ratingError.textContent = "";
    }
});
