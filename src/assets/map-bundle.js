"use strict";
(() => {
  // src/map/types.ts
  function createMapState() {
    return {
      map: null,
      currentTheme: "light",
      roadLayers: [],
      poiMarkers: [],
      userLocationMarker: null,
      selectedLocationMarker: null,
      loadedNodes: {},
      loadedWays: [],
      loadedPoisData: [],
      routeLayer: null,
      routeMarkers: [],
      pendingMessages: []
    };
  }

  // src/map/messageBridge.ts
  function initMessageBridge(state2) {
    window.getAndClearMessages = function() {
      const msgs = JSON.stringify(state2.pendingMessages);
      state2.pendingMessages = [];
      return msgs;
    };
    window.postMessage = function(type, data) {
      state2.pendingMessages.push({ type, data });
    };
  }
  function postMessage(state2, type, data) {
    state2.pendingMessages.push({ type, data });
  }
  function postSearchResults(state2, results, maxResults = 10) {
    postMessage(state2, "search-results", results.slice(0, maxResults));
  }
  function postPOISelected(state2, poi) {
    postMessage(state2, "poi-selected", {
      name: poi.name,
      category: poi.category,
      subcategory: poi.subcategory,
      latitude: poi.latitude,
      longitude: poi.longitude,
      id: poi.id
    });
  }
  function postMapClicked(state2, lat, lng) {
    postMessage(state2, "map-clicked", { lat, lng });
  }
  function postRouteDrawn(state2, fromLat, fromLng, toLat, toLng, distance) {
    postMessage(state2, "route-drawn", { distance, fromLat, fromLng, toLat, toLng });
  }
  function postMapDataLoaded(state2) {
    postMessage(state2, "map-data-loaded", { loaded: true, poiCount: state2.loadedPoisData.length });
  }

  // src/map/bufferPolyfill.ts
  function installBufferPolyfill() {
    if (typeof window.Buffer !== "undefined" && typeof window.Buffer.alloc === "function") return;
    const BufPolyfill = Uint8Array;
    if (typeof TextDecoder !== "undefined") {
      BufPolyfill.prototype.toString = function(encoding) {
        if (encoding === "utf8" || encoding === "utf-8") {
          return new TextDecoder("utf-8").decode(this);
        }
        return "";
      };
    }
    window.Buffer = BufPolyfill;
  }
  function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // src/map/gpsMarker.ts
  var GPS_STYLES = `
.gps-marker-container { position: relative; width: 20px; height: 20px; }
.gps-marker-dot { width: 14px; height: 14px; border-radius: 50%; background-color: #1a73e8; border: 3px solid #fff; box-shadow: 0 0 6px rgba(0,0,0,0.3); position: absolute; top: 3px; left: 3px; z-index: 10; }
.gps-marker-dot.disconnected { background-color: #9aa0a6 !important; }
.gps-marker-halo { width: 32px; height: 32px; border-radius: 50%; background-color: rgba(26,115,232,0.25); position: absolute; top: -6px; left: -6px; animation: gps-pulse 2.5s infinite; pointer-events: none; z-index: 1; }
.gps-marker-halo.disconnected { display: none !important; }
`;
  function injectGPSStyles() {
    const style = document.createElement("style");
    style.textContent = GPS_STYLES;
    document.head.appendChild(style);
  }
  function updateGPSMarker(state2, lat, lng, connected) {
    const gpsClass = connected ? "gps-marker-dot" : "gps-marker-dot disconnected";
    const haloClass = connected ? "gps-marker-halo" : "gps-marker-halo disconnected";
    const html = '<div class="gps-marker-container"><div class="' + haloClass + '"></div><div class="' + gpsClass + '"></div></div>';
    const icon = L.divIcon({
      className: "gps-custom-icon",
      html,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    if (state2.userLocationMarker) {
      state2.userLocationMarker.setLatLng([lat, lng]);
      state2.userLocationMarker.setIcon(icon);
    } else {
      state2.userLocationMarker = L.marker([lat, lng], { icon, zIndexOffset: 1e3 }).addTo(state2.map);
    }
  }
  function centerOnUser(state2) {
    if (state2.userLocationMarker) {
      state2.map.setView(state2.userLocationMarker.getLatLng(), 15);
    }
  }
  function centerOnCoordinates(state2, lat, lng, zoom) {
    state2.map.setView([lat, lng], zoom || state2.map.getZoom());
  }

  // src/map/poiRenderer.ts
  var SVG_ICONS = {
    hospital: '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>',
    restaurant: '<svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm8-3h-3V2h-2v11.13c0 1.44.97 2.66 2.38 2.87V22h2.5v-6c1-.22 1.76-1.1 1.95-2.16l.67-4.03C22.75 6.64 21.14 6 19 6z"/></svg>',
    cafe: '<svg viewBox="0 0 24 24"><path d="M4 19h16v2H4zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm-2 10c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V5h12v8zm2-5h-2V5h2v3z"/></svg>',
    shop: '<svg viewBox="0 0 24 24"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2c0 .55.45 1 1 1h1v6h10v-6h4v6h2v-6h1c.55 0 1-.45 1-1zm-9 6H6v-4h6v4z"/></svg>',
    place_of_worship: '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
    default: '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
  };
  var CATEGORY_COLORS = {
    hospital: "#1a73e8",
    school: "#f2a134",
    restaurant: "#e52592",
    cafe: "#e52592",
    fast_food: "#e52592",
    pub: "#e52592",
    bar: "#e52592",
    shop: "#4285f4",
    place_of_worship: "#795548",
    bank: "#0f9d58",
    pharmacy: "#1a73e8",
    fuel: "#0f9d58",
    hotel: "#ab47bc",
    tourism: "#ab47bc",
    leisure: "#0f9d58"
  };
  function getPOIColor(poi) {
    return CATEGORY_COLORS[poi.subcategory] || CATEGORY_COLORS[poi.category] || "#9aa0a6";
  }
  function getPOIIcon(poi) {
    const sub = poi.subcategory || "";
    const cat = poi.category || "";
    if (sub.includes("worship") || cat.includes("worship")) return SVG_ICONS.place_of_worship;
    if (sub === "hospital" || sub === "clinic" || sub === "doctors" || sub === "pharmacy") return SVG_ICONS.hospital;
    if (sub === "restaurant" || sub === "fast_food" || sub === "food_court") return SVG_ICONS.restaurant;
    if (sub === "cafe") return SVG_ICONS.cafe;
    if (cat === "shop") return SVG_ICONS.shop;
    return SVG_ICONS[sub] || SVG_ICONS[cat] || SVG_ICONS.default;
  }
  function renderPOI(state2, poi) {
    const color = getPOIColor(poi);
    const iconSvg = getPOIIcon(poi);
    const markerHtml = '<div class="poi-icon-wrapper">' + iconSvg + "</div>";
    const poiId = "poi-" + poi.id;
    const customIcon = L.divIcon({
      className: "poi-icon",
      html: markerHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    const marker = L.marker([poi.latitude, poi.longitude], { icon: customIcon }).addTo(state2.map);
    marker.on("add", function() {
      const el = marker.getElement();
      if (el) {
        el.id = poiId;
        el.style.backgroundColor = color;
      }
    });
    marker.on("click", function(e) {
      clearSelectedPin(state2);
      L.DomEvent.stopPropagation(e);
      postPOISelected(state2, poi);
    });
    state2.poiMarkers.push(marker);
  }
  function renderAllPOIs(state2, pois) {
    state2.loadedPoisData = pois;
    pois.forEach((poi) => renderPOI(state2, poi));
  }
  function clearPOIs(state2) {
    state2.poiMarkers.forEach((m) => state2.map.removeLayer(m));
    state2.poiMarkers = [];
  }
  function setSelectedPin(state2, lat, lng, title) {
    clearSelectedPin(state2);
    const redPinSvg = '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
    const redIcon = L.divIcon({
      className: "poi-icon",
      html: redPinSvg,
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });
    state2.selectedLocationMarker = L.marker([lat, lng], { icon: redIcon }).addTo(state2.map);
    if (title) {
      state2.selectedLocationMarker.bindTooltip(title, { permanent: false, direction: "top" });
    }
  }
  function clearSelectedPin(state2) {
    if (state2.selectedLocationMarker) {
      state2.map.removeLayer(state2.selectedLocationMarker);
      state2.selectedLocationMarker = null;
    }
  }

  // src/map/roadRenderer.ts
  function getRoadStyle(highwayType, isDark) {
    const style = {
      color: isDark ? "#3a3a3a" : "#ffffff",
      weight: 2,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round"
    };
    switch (highwayType) {
      case "motorway":
      case "trunk":
      case "primary":
        style.color = isDark ? "#f2a134" : "#ffe0b2";
        style.weight = 5;
        break;
      case "secondary":
        style.color = isDark ? "#d48822" : "#fff3e0";
        style.weight = 4;
        break;
      case "tertiary":
        style.color = isDark ? "#4a4a4a" : "#fcfcfc";
        style.weight = 3.5;
        break;
      case "residential":
      case "unclassified":
        style.color = isDark ? "#333333" : "#ffffff";
        style.weight = 2.5;
        break;
      case "service":
      case "road":
        style.color = isDark ? "#2a2a2a" : "#eaeaea";
        style.weight = 2;
        break;
      case "footway":
      case "path":
      case "cycleway":
      case "pedestrian":
      case "track":
        style.color = isDark ? "#2e3a2e" : "#d2e4d2";
        style.weight = 1.5;
        style.dashArray = "4, 4";
        break;
    }
    return style;
  }
  function renderRoads(state2) {
    state2.loadedWays.forEach((way) => {
      if (!way.tags || !way.tags.highway) return;
      const latlngs = [];
      for (let i = 0; i < way.nodes.length; i++) {
        const nodeCoords = state2.loadedNodes[way.nodes[i]];
        if (nodeCoords) {
          latlngs.push(nodeCoords);
        }
      }
      if (latlngs.length < 2) return;
      const isDark = state2.currentTheme === "dark";
      const style = getRoadStyle(way.tags.highway, isDark);
      if (!style.dashArray) {
        const borderStyle = {
          color: isDark ? "#121212" : "#e0e0e0",
          weight: style.weight + 1.5,
          opacity: 0.6,
          lineCap: "round",
          lineJoin: "round"
        };
        const bgLine = L.polyline(latlngs, borderStyle).addTo(state2.map);
        state2.roadLayers.push(bgLine);
      }
      const line = L.polyline(latlngs, style).addTo(state2.map);
      if (way.tags.name) {
        line.bindTooltip(way.tags.name, { sticky: true, className: "street-label" });
      }
      state2.roadLayers.push(line);
    });
  }
  function redrawRoads(state2) {
    state2.roadLayers.forEach((l) => state2.map.removeLayer(l));
    state2.roadLayers = [];
    renderRoads(state2);
  }
  function clearRoads(state2) {
    state2.roadLayers.forEach((l) => state2.map.removeLayer(l));
    state2.roadLayers = [];
    state2.loadedNodes = {};
    state2.loadedWays = [];
  }

  // src/map/searchEngine.ts
  function runSearch(state2, query, anchorLat, anchorLon) {
    const q = (query || "").toLowerCase().trim();
    const poiResults = [];
    const roadResults = [];
    if (q.length === 0) {
      state2.loadedPoisData.forEach((item) => {
        poiResults.push({
          name: item.name || "Unknown",
          category: item.category,
          subcategory: item.subcategory,
          latitude: item.latitude,
          longitude: item.longitude,
          id: item.id
        });
      });
    } else {
      const exactMatches = [];
      const prefixMatches = [];
      const containsMatches = [];
      state2.loadedPoisData.forEach((poi) => {
        if (!poi.name) return;
        const nameLower = poi.name.toLowerCase();
        const subcatLower = (poi.subcategory || "").toLowerCase();
        const catLower = (poi.category || "").toLowerCase();
        if (nameLower === q) {
          exactMatches.push(poi);
        } else if (nameLower.startsWith(q)) {
          prefixMatches.push(poi);
        } else if (nameLower.includes(q) || subcatLower.includes(q) || catLower.includes(q)) {
          containsMatches.push(poi);
        }
      });
      [...exactMatches, ...prefixMatches, ...containsMatches].forEach((item) => {
        poiResults.push({
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          latitude: item.latitude,
          longitude: item.longitude,
          id: item.id
        });
      });
    }
    if (q.length > 0) {
      const seen = {};
      state2.loadedWays.forEach((way, idx) => {
        if (way.tags && way.tags.name) {
          const name = way.tags.name;
          if (name.toLowerCase().includes(q) && !seen[name]) {
            seen[name] = true;
            const midIdx = Math.floor(way.nodes.length / 2);
            const midNode = state2.loadedNodes[way.nodes[midIdx]];
            if (midNode) {
              roadResults.push({
                name,
                category: "road",
                subcategory: way.tags.highway || "road",
                latitude: midNode[0],
                longitude: midNode[1],
                id: "road-" + idx
              });
            }
          }
        }
      });
    }
    const combined = [...poiResults, ...roadResults];
    if (anchorLat !== void 0 && anchorLon !== void 0 && state2.map) {
      const anchor = L.latLng(anchorLat, anchorLon);
      combined.forEach((item) => {
        const pt = L.latLng(item.latitude, item.longitude);
        item.distance = state2.map.distance(anchor, pt) / 1e3;
      });
      if (q.length === 0) {
        combined.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
    }
    postSearchResults(state2, combined, 10);
  }

  // src/map/routeDrawer.ts
  function drawRoute(state2, fromLat, fromLng, toLat, toLng) {
    clearRoute(state2);
    const routePoints = [[fromLat, fromLng], [toLat, toLng]];
    state2.routeLayer = L.polyline(routePoints, {
      color: "#1a73e8",
      weight: 5,
      opacity: 0.8,
      dashArray: "12, 8",
      lineCap: "round",
      lineJoin: "round"
    }).addTo(state2.map);
    const startIcon = L.divIcon({
      className: "route-marker-start",
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#0f9d58;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    const endIcon = L.divIcon({
      className: "route-marker-end",
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#ea4335;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    state2.routeMarkers.push(L.marker([fromLat, fromLng], { icon: startIcon, zIndexOffset: 900 }).addTo(state2.map));
    state2.routeMarkers.push(L.marker([toLat, toLng], { icon: endIcon, zIndexOffset: 900 }).addTo(state2.map));
    state2.map.fitBounds(state2.routeLayer.getBounds().pad(0.3));
    const dist = state2.map.distance(L.latLng(fromLat, fromLng), L.latLng(toLat, toLng));
    const distText = dist > 1e3 ? (dist / 1e3).toFixed(1) + " km" : Math.round(dist) + " m";
    postRouteDrawn(state2, fromLat, fromLng, toLat, toLng, distText);
  }
  function clearRoute(state2) {
    if (state2.routeLayer) {
      state2.map.removeLayer(state2.routeLayer);
      state2.routeLayer = null;
    }
    state2.routeMarkers.forEach((m) => state2.map.removeLayer(m));
    state2.routeMarkers = [];
  }

  // src/map/mapEngine.ts
  var state = createMapState();
  function bootMap(mapInstance) {
    state.map = mapInstance;
    installBufferPolyfill();
    injectGPSStyles();
    initMessageBridge(state);
    mapInstance.on("click", (e) => {
      setSelectedPin(state, e.latlng.lat, e.latlng.lng, "Dropped Pin");
      postMapClicked(state, e.latlng.lat, e.latlng.lng);
    });
    window.loadMapDataDirect = (pbfBase64, poisJson, centerLat, centerLng, zoom, isGPSConnected) => {
      clearRoads(state);
      clearPOIs(state);
      state.map.setView([centerLat, centerLng], zoom || 14);
      if (pbfBase64) {
        try {
          const pbfBytes = base64ToUint8Array(pbfBase64);
          const osmData = osmpbf(pbfBytes);
          osmData.elements.forEach((el) => {
            if (el.type === "node") {
              state.loadedNodes[el.id] = [el.lat, el.lon];
            } else if (el.type === "way") {
              state.loadedWays.push(el);
            }
          });
          renderRoads(state);
          console.log("[VERBOSE] Rendered " + state.loadedWays.length + " roads.");
        } catch (err) {
          console.error("[VERBOSE] PBF parse error: " + err.message);
        }
      }
      if (poisJson) {
        try {
          const pois = JSON.parse(poisJson);
          renderAllPOIs(state, pois);
          console.log("[VERBOSE] Loaded " + state.loadedPoisData.length + " POIs.");
        } catch (err) {
          console.error("[VERBOSE] POI parse error: " + err.message);
        }
      }
      if (state.userLocationMarker) {
        state.userLocationMarker.addTo(state.map);
      }
      postMapDataLoaded(state);
    };
    window.setTheme = (theme) => {
      state.currentTheme = theme;
      document.body.className = theme === "dark" ? "dark-theme" : "light-theme";
      document.getElementById("map").style.backgroundColor = theme === "dark" ? "#1a1a1a" : "#f4f3f0";
      redrawRoads(state);
    };
    window.updateUserLocation = (lat, lng, connected) => {
      updateGPSMarker(state, lat, lng, connected);
    };
    window.centerOnUser = () => centerOnUser(state);
    window.centerOnCoordinates = (lat, lng, zoom) => centerOnCoordinates(state, lat, lng, zoom);
    window.clearSelectedPin = () => clearSelectedPin(state);
    window.runSearch = (query, anchorLat, anchorLon) => runSearch(state, query, anchorLat, anchorLon);
    window.drawRoute = (fromLat, fromLng, toLat, toLng) => drawRoute(state, fromLat, fromLng, toLat, toLng);
    window.clearRoute = () => clearRoute(state);
    window.focusPoi = (lat, lng, name) => {
      state.map.setView([lat, lng], 17);
      setSelectedPin(state, lat, lng, name);
      postMessage(state, "poi-selected", { name, latitude: lat, longitude: lng, category: "", subcategory: "", id: 0 });
    };
  }

  // src/map/map-bundle.ts
  window.__mapBundleReady = function() {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
      console.error("[VERBOSE] map-bundle.ts: #map container not found");
      return;
    }
    const map = L.map("map", {
      zoomControl: false,
      attributionControl: false
    }).setView([31.5656822, 74.3141829], 13);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      crossOrigin: true,
      errorTileUrl: ""
    }).addTo(map);
    bootMap(map);
  };
})();
