// =====================================
// MAPA
// =====================================

const map = L.map('map').setView(
    [29.0469, -13.5899],
    10
);

L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles © Esri'
    }
).addTo(map);

// =====================================
// CLUSTER
// =====================================

const cluster = L.markerClusterGroup();
map.addLayer(cluster);

const markers = [];

// =====================================
// CARGAR JSON
// =====================================

fetch("lanzarote-data.json")
.then(r => r.json())
.then(data => {

    data.lugares.forEach(item => {

        let color;
        let faIcon;

        switch(item.tipo){

            case "hotel":
                color = "#2563eb";
                faIcon = "fa-hotel";
                break;

            case "restaurante":
                color = "#dc2626";
                faIcon = "fa-utensils";
                break;

            case "playa":
                color = "#0ea5e9";
                faIcon = "fa-umbrella-beach";
                break;

            default:
                color = "#16a34a";
                faIcon = "fa-camera";
        }

        const icon = L.divIcon({

            className: "",

            html: `
                <i
                    class="fa-solid ${faIcon}"
                    style="
                        font-size:28px;
                        color:${color};
                        text-shadow:0 0 3px white;
                    ">
                </i>
            `
        });

        let popup = `
        <div style="min-width:220px">

            <div class="popup-title">
                ${item.nombre}
            </div>

            ${
                item.precio
                ? `<p><strong>💰 Precio:</strong> ${item.precio}</p>`
                : ''
            }

            ${
                item.descripcion
                ? `<p><strong>📝 Descripción:</strong><br>${item.descripcion}</p>`
                : ''
            }
        `;

        if(item.favorito){

            popup += `
                <p class="favorito">
                    ⭐ Recomendado por Fernando
                </p>
            `;
        }

        if(item.web){

            popup += `
                <p>
                    <a href="${item.web}"
                       target="_blank">
                       🌐 Página web
                    </a>
                </p>
            `;
        }

        if(item.maps){

            popup += `
                <p>
                    <a href="${item.maps}"
                       target="_blank">
                       📍 Google Maps
                    </a>
                </p>
            `;
        }

        popup += `</div>`;

        const marker = L.marker(
            [item.lat, item.lng],
            {
                icon: icon
            }
        );

        marker.info = item;

        marker.bindPopup(popup);

        marker.on("mouseover", function() {
            this.openPopup();
        });

        markers.push(marker);

    });

    actualizarFiltros();

});

// =====================================
// EVENTOS
// =====================================

document
.querySelectorAll(
    '#sidebar input[type="checkbox"]'
)
.forEach(cb => {

    cb.addEventListener(
        "change",
        actualizarFiltros
    );

});

document
.getElementById("btnCentro")
.addEventListener(
    "click",
    () => {

        map.setView(
            [29.0469, -13.5899],
            10
        );

    }
);

// =====================================
// FILTROS
// =====================================

function actualizarFiltros(){

    cluster.clearLayers();

    const categorias = [];

    document
    .querySelectorAll(
        'input[data-tipo]'
    )
    .forEach(cb => {

        if(cb.checked){

            categorias.push(
                cb.dataset.tipo
            );

        }

    });

    const soloFavoritos =
        document.getElementById(
            "soloFavoritos"
        ).checked;

    const texto =
        document.getElementById(
            "buscador"
        )
        .value
        .toLowerCase()
        .trim();

    let contador = 0;

    markers.forEach(marker => {

        const info = marker.info;

        let mostrar = true;

        // FILTRO CATEGORIA

        if(
            !categorias.includes(
                info.tipo
            )
        ){
            mostrar = false;
        }

        // FILTRO FAVORITOS

        if(
            soloFavoritos &&
            !info.favorito
        ){
            mostrar = false;
        }

        // FILTRO TEXTO

        if(
            texto &&
            !info.nombre
                .toLowerCase()
                .includes(texto)
        ){
            mostrar = false;
        }

        if(mostrar){

            cluster.addLayer(
                marker
            );

            contador++;

        }

    });

    document
    .getElementById(
        "contador"
    )
    .innerHTML =
    `📍 ${contador} lugares`;

}
