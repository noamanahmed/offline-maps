import 'package:flutter/material.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart' as fm;
import 'package:latlong2/latlong.dart';
import 'package:pakistan_offline_map_explorer/services/map_parser.dart';

class _RoadStyle {
  final Color color;
  final double width;
  final bool dashed;
  const _RoadStyle(this.color, this.width, {this.dashed = false});
}

_RoadStyle _roadStyle(String highway, bool isDark) {
  switch (highway) {
    case 'motorway': case 'trunk': case 'primary':
      return _RoadStyle(isDark ? const Color(0xFFF2A134) : const Color(0xFFE65100), 5);
    case 'secondary':
      return _RoadStyle(isDark ? const Color(0xFFD48822) : const Color(0xFFF57C00), 4);
    case 'tertiary':
      return _RoadStyle(isDark ? const Color(0xFF4A4A4A) : const Color(0xFF757575), 3.5);
    case 'residential': case 'unclassified':
      return _RoadStyle(isDark ? const Color(0xFF555555) : const Color(0xFF9E9E9E), 2.5);
    case 'service': case 'road':
      return _RoadStyle(isDark ? const Color(0xFF333333) : const Color(0xFFBDBDBD), 2);
    case 'footway': case 'path': case 'cycleway': case 'pedestrian': case 'track':
      return _RoadStyle(isDark ? const Color(0xFF2E3A2E) : const Color(0xFF81C784), 1.5, dashed: true);
    default:
      return _RoadStyle(isDark ? const Color(0xFF444444) : const Color(0xFFBDBDBD), 2);
  }
}

Color _poiColor(String category, String subcategory) {
  final s = subcategory.toLowerCase(), c = category.toLowerCase();
  if (s == 'hospital' || s == 'clinic' || s == 'doctors' || s == 'pharmacy') return const Color(0xFF1A73E8);
  if (s == 'school' || s == 'college' || s == 'university') return const Color(0xFFF2A134);
  if (s == 'restaurant' || s == 'fast_food' || s == 'cafe' || s == 'pub' || s == 'bar' || s == 'food_court') return const Color(0xFFE52592);
  if (c == 'shop') return const Color(0xFF4285F4);
  if (s.contains('worship') || c.contains('worship')) return const Color(0xFF795548);
  if (s == 'bank' || s == 'fuel') return const Color(0xFF0F9D58);
  if (s == 'hotel' || c == 'tourism' || s == 'leisure') return const Color(0xFFAB47BC);
  return const Color(0xFF9AA0A6);
}

IconData _poiIconData(String category, String subcategory) {
  final s = subcategory.toLowerCase(), c = category.toLowerCase();
  if (s.contains('worship') || c.contains('worship')) return Icons.church;
  if (s == 'hospital' || s == 'clinic' || s == 'doctors' || s == 'pharmacy') return Icons.local_hospital;
  if (s == 'restaurant' || s == 'fast_food' || s == 'food_court') return Icons.restaurant;
  if (s == 'cafe') return Icons.local_cafe;
  if (s == 'bank') return Icons.account_balance;
  if (s == 'fuel') return Icons.local_gas_station;
  if (s == 'hotel' || c == 'tourism') return Icons.hotel;
  if (s == 'school' || s == 'college' || s == 'university') return Icons.school;
  if (c == 'shop') return Icons.store;
  if (c == 'leisure') return Icons.park;
  return Icons.place;
}

class MapController extends ChangeNotifier {
  fm.MapController? _fmCtrl;
  String _theme = 'light';
  double _currentZoom = 12;

  Map<int, LatLng> _osmNodes = {};
  List<({String highway, String name, List<int> refs})> _wayData = [];
  List<({String name, String category, String subcategory, double lat, double lon})> _poiData = [];
  List<({String name, String placeType, double lat, double lon})> _placeLabels = [];

  List<fm.Polyline> _roads = [];
  List<fm.Marker> _poiMarkers = [];
  List<fm.Marker> _roadLabels = [];
  List<fm.Marker> _placeMarkers = [];
  fm.Marker? _userMarker;
  fm.Marker? _selMarker;
  List<fm.Marker> _routeMarkers = [];
  fm.Polyline? _routeLine;

  LatLng? _pendingCenter;
  double? _pendingZoom;

  void Function(int poiCount)? onMapLoaded;
  void Function(Map<String, dynamic> data)? onPoiSelected;
  void Function(Map<String, dynamic> data)? onMapTap;
  void Function(Map<String, dynamic> data)? onRouteDrawn;
  void Function(List<Map<String, dynamic>> results)? onSearchResults;

  fm.MapController? get fmCtrl => _fmCtrl;
  List<fm.Polyline> get roads => _roads;
  List<fm.Marker> get poiMarkers => _poiMarkers;
  List<fm.Marker> get roadLabels => _roadLabels;
  List<fm.Marker> get placeMarkers => _placeMarkers;
  fm.Marker? get userMarker => _userMarker;
  fm.Marker? get selMarker => _selMarker;
  List<fm.Marker> get routeMarkers => _routeMarkers;
  fm.Polyline? get routeLine => _routeLine;
  String get theme => _theme;

  void onMapReady(fm.MapController c) {
    _fmCtrl = c;
    if (_pendingCenter != null) {
      c.move(_pendingCenter!, _pendingZoom ?? 12);
      _pendingCenter = null;
      _pendingZoom = null;
    }
  }

  Future<void> loadParsedData(ParsedMapData parsed, double centerLat, double centerLng, int zoom) async {
    _roads.clear();
    _poiMarkers.clear();
    _poiData.clear();
    _roadLabels.clear();
    _placeMarkers.clear();
    _placeLabels.clear();
    _selMarker = null;
    _routeMarkers.clear();
    _routeLine = null;
    _wayData = parsed.ways;
    _poiData = parsed.pois;
    _placeLabels = parsed.placeLabels;

    _currentZoom = zoom.toDouble();
    _pendingCenter = LatLng(centerLat, centerLng);
    _pendingZoom = zoom.toDouble();
    if (_fmCtrl != null) {
      _fmCtrl!.move(_pendingCenter!, _pendingZoom!);
      _pendingCenter = null;
      _pendingZoom = null;
    }

    _osmNodes.clear();
    for (final n in parsed.nodes) {
      _osmNodes[n.id] = LatLng(n.lat, n.lon);
    }

    print('[map_widget] Parsed data — nodes: ${parsed.nodes.length}, ways: ${parsed.ways.length}, pois: ${parsed.pois.length}, placeLabels: ${parsed.placeLabels.length}');
    print('[map_widget] _osmNodes built: ${_osmNodes.length} entries, _wayData: ${_wayData.length} entries');

    await _buildRoadsBatched();
    _buildRoadLabels();
    _buildPlaceMarkers();
    _rebuildPoiMarkers();
    print('[map_widget] Roads built: ${_roads.length}, Road labels: ${_roadLabels.length}, Place labels: ${_placeMarkers.length}, POI markers: ${_poiMarkers.length}');

    onMapLoaded?.call(_poiData.length);
    notifyListeners();
  }

  void onZoomChanged(double zoom) {
    _currentZoom = zoom;
    _rebuildPoiMarkers();
  }

  void _rebuildPoiMarkers() {
    _poiMarkers.clear();

    const maxPois = 20;

    List<({double dist, int index})> sorted;
    if (_fmCtrl != null) {
      sorted = [];
      final center = _fmCtrl!.camera.center;
      for (var i = 0; i < _poiData.length; i++) {
        final p = _poiData[i];
        sorted.add((dist: const Distance().distance(center, LatLng(p.lat, p.lon)), index: i));
      }
      sorted.sort((a, b) => a.dist.compareTo(b.dist));
    } else {
      sorted = List.generate(_poiData.length, (i) => (dist: 0.0, index: i));
    }

    final toRender = sorted.take(maxPois).toList();
    for (final s in toRender) {
      _poiMarkers.add(_buildPoiMarker(_poiData[s.index]));
    }
    notifyListeners();
  }

  Future<void> _buildRoadsBatched() async {
    _roads.clear();
    const batchSize = 100;
    for (var i = 0; i < _wayData.length; i += batchSize) {
      final end = i + batchSize > _wayData.length ? _wayData.length : i + batchSize;
      for (var j = i; j < end; j++) {
        final way = _wayData[j];
        final points = <LatLng>[];
        for (final ref in way.refs) {
          final pt = _osmNodes[ref];
          if (pt != null) points.add(pt);
        }
        if (points.length < 2) continue;
        final style = _roadStyle(way.highway, _theme == 'dark');
        _roads.add(fm.Polyline(
          points: points,
          color: style.color,
          strokeWidth: style.width,
          pattern: style.dashed
              ? const fm.StrokePattern.dotted(spacingFactor: 2.0)
              : const fm.StrokePattern.solid(),
        ));
      }
      notifyListeners();
      await Future.delayed(const Duration(milliseconds: 0));
    }
  }

  void _buildRoadLabels() {
    _roadLabels.clear();
    final isDark = _theme == 'dark';
    final labelColor = isDark ? const Color(0xFFCCCCCC) : const Color(0xFF444444);
    final bgColor = isDark ? const Color(0xCC1A1A1A) : const Color(0xCCFFFFFF);

    // Only label major named roads to avoid clutter
    const majorTypes = {'motorway', 'trunk', 'primary', 'secondary', 'tertiary'};
    final seen = <String>{};

    for (final way in _wayData) {
      if (way.name.isEmpty) continue;
      if (!majorTypes.contains(way.highway)) continue;
      if (seen.contains(way.name)) continue;
      seen.add(way.name);

      // Find the midpoint of the road
      final midRef = way.refs[way.refs.length ~/ 2];
      final midPt = _osmNodes[midRef];
      if (midPt == null) continue;

      _roadLabels.add(fm.Marker(
        point: midPt,
        width: 120,
        height: 20,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            way.name,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: labelColor,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
        ),
      ));
    }
  }

  void _buildPlaceMarkers() {
    _placeMarkers.clear();
    final isDark = _theme == 'dark';

    for (final p in _placeLabels) {
      double fontSize;
      FontWeight fontWeight;
      Color textColor;

      switch (p.placeType) {
        case 'city':
          fontSize = 16;
          fontWeight = FontWeight.w800;
          textColor = isDark ? const Color(0xFFE0E0E0) : const Color(0xFF212121);
        case 'town':
          fontSize = 14;
          fontWeight = FontWeight.w700;
          textColor = isDark ? const Color(0xFFBDBDBD) : const Color(0xFF424242);
        case 'village':
          fontSize = 12;
          fontWeight = FontWeight.w600;
          textColor = isDark ? const Color(0xFF9E9E9E) : const Color(0xFF616161);
        case 'suburb': case 'neighbourhood': case 'quarter':
          fontSize = 11;
          fontWeight = FontWeight.w500;
          textColor = isDark ? const Color(0xFF757575) : const Color(0xFF757575);
        default:
          fontSize = 10;
          fontWeight = FontWeight.w500;
          textColor = isDark ? const Color(0xFF616161) : const Color(0xFF9E9E9E);
      }

      _placeMarkers.add(fm.Marker(
        point: LatLng(p.lat, p.lon),
        width: 150,
        height: 24,
        child: Text(
          p.name,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: fontWeight,
            color: textColor,
            letterSpacing: 0.5,
            shadows: [
              Shadow(
                color: isDark ? Colors.black54 : Colors.white,
                blurRadius: 3,
              ),
            ],
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
        ),
      ));
    }
  }

  fm.Marker _buildPoiMarker(({String name, String category, String subcategory, double lat, double lon}) p) {
    final color = _poiColor(p.category, p.subcategory);
    final icon = _poiIconData(p.category, p.subcategory);
    final hasName = p.name.isNotEmpty;

    return fm.Marker(
      point: LatLng(p.lat, p.lon),
      width: hasName ? 120 : 30,
      height: hasName ? 48 : 30,
      child: GestureDetector(
        onTap: () => onPoiSelected?.call({
          'name': p.name, 'category': p.category, 'subcategory': p.subcategory,
          'latitude': p.lat, 'longitude': p.lon,
        }),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 28, height: 28,
              decoration: BoxDecoration(
                color: color, shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
                boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 5)],
              ),
              child: Icon(icon, size: 16, color: Colors.white),
            ),
            if (hasName)
              Container(
                margin: const EdgeInsets.only(top: 2),
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(3),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 2)],
                ),
                child: Text(
                  p.name,
                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: Color(0xFF333333)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
          ],
        ),
      ),
    );
  }

  void setTheme(String t) { _theme = t; _buildRoadsBatched(); _buildRoadLabels(); _buildPlaceMarkers(); }

  void updateUserLocation(double lat, double lng, bool connected) {
    _userMarker = fm.Marker(
      point: LatLng(lat, lng),
      width: 36, height: 36,
      child: Transform.rotate(
        angle: 0,
        child: Icon(
          Icons.directions_car,
          size: 28,
          color: connected ? const Color(0xFF1A73E8) : const Color(0xFF9AA0A6),
          shadows: const [Shadow(color: Colors.black26, blurRadius: 4)],
        ),
      ),
    );
    notifyListeners();
  }

  void centerOnUser() {
    if (_userMarker != null && _fmCtrl != null) _fmCtrl!.move(_userMarker!.point, 15);
  }

  void rotateMap() {
    if (_fmCtrl == null) return;
    final current = _fmCtrl!.camera.rotation;
    _fmCtrl!.rotate(current + 45);
  }

  void centerOnCoords(double lat, double lng, [int? z]) {
    final pt = LatLng(lat, lng);
    if (_fmCtrl != null) { _fmCtrl!.move(pt, z?.toDouble() ?? _fmCtrl!.camera.zoom); }
    else { _pendingCenter = pt; _pendingZoom = z?.toDouble(); }
  }

  void focusPoi(double lat, double lng, String name) {
    setSelPin(lat, lng, name);
    if (_fmCtrl != null) _fmCtrl!.move(LatLng(lat, lng), 17);
  }

  void setSelPin(double lat, double lng, String title) {
    _selMarker = fm.Marker(
      point: LatLng(lat, lng), width: 30, height: title.isNotEmpty ? 52 : 36,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 30, height: 36,
            decoration: const BoxDecoration(
              color: Color(0xFFEA4335), shape: BoxShape.circle,
              border: Border.fromBorderSide(BorderSide(color: Colors.white, width: 2)),
              boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 5)],
            ),
            child: const Icon(Icons.location_on, size: 20, color: Colors.white),
          ),
          if (title.isNotEmpty)
            Container(
              margin: const EdgeInsets.only(top: 2),
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(4),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 3)]),
              child: Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
            ),
        ],
      ),
    );
    notifyListeners();
  }

  void clearSelPin() { _selMarker = null; notifyListeners(); }

  void drawRoute(double fromLat, double fromLng, double toLat, double toLng) {
    _routeMarkers = [
      fm.Marker(point: LatLng(fromLat, fromLng), width: 14, height: 14,
        child: Container(decoration: const BoxDecoration(color: Color(0xFF0F9D58), shape: BoxShape.circle,
            border: Border.fromBorderSide(BorderSide(color: Colors.white, width: 3))))),
      fm.Marker(point: LatLng(toLat, toLng), width: 14, height: 14,
        child: Container(decoration: const BoxDecoration(color: Color(0xFFEA4335), shape: BoxShape.circle,
            border: Border.fromBorderSide(BorderSide(color: Colors.white, width: 3))))),
    ];
    _routeLine = fm.Polyline(points: [LatLng(fromLat, fromLng), LatLng(toLat, toLng)],
      color: const Color(0xFF1A73E8), strokeWidth: 5,
      pattern: const fm.StrokePattern.dotted(spacingFactor: 1.5));

    final dist = const Distance().distance(LatLng(fromLat, fromLng), LatLng(toLat, toLng));
    onRouteDrawn?.call({'distance': dist > 1000 ? '${(dist/1000).toStringAsFixed(1)} km' : '${dist.round()} m'});
    notifyListeners();
  }

  void clearRoute() { _routeMarkers.clear(); _routeLine = null; notifyListeners(); }

  void runSearch(String q, double anchorLat, double anchorLng) {
    final ql = q.trim().toLowerCase();
    final results = <Map<String, dynamic>>[];
    final anchor = LatLng(anchorLat, anchorLng);

    for (final p in _poiData) {
      final n = p.name.toLowerCase();
      final s = p.subcategory.toLowerCase(); final c = p.category.toLowerCase();
      final match = ql.isEmpty || n == ql || n.startsWith(ql) || n.contains(ql) || s.contains(ql) || c.contains(ql);
      if (!match) continue;
      final dist = const Distance().distance(anchor, LatLng(p.lat, p.lon)) / 1000;
      results.add({'name': p.name, 'category': p.category, 'subcategory': p.subcategory,
        'latitude': p.lat, 'longitude': p.lon, 'distance': dist});
    }

    for (final way in _wayData) {
      if (way.name.isEmpty || !way.name.toLowerCase().contains(ql)) continue;
      if (way.refs.isEmpty) continue;
      final midPt = _osmNodes[way.refs[way.refs.length ~/ 2]];
      if (midPt == null) continue;
      final dist = const Distance().distance(anchor, midPt) / 1000;
      results.add({'name': way.name, 'category': 'road', 'subcategory': way.highway,
        'latitude': midPt.latitude, 'longitude': midPt.longitude, 'distance': dist});
    }

    results.sort((a, b) => (a['distance'] as double).compareTo(b['distance'] as double));
    onSearchResults?.call(results.take(15).toList());
  }

  @override
  void dispose() {
    _wayData.clear(); _poiData.clear(); _osmNodes.clear(); _placeLabels.clear();
    super.dispose();
  }
}

class MapWidget extends StatefulWidget {
  final MapController controller;
  const MapWidget({super.key, required this.controller});

  @override
  State<MapWidget> createState() => _MapWidgetState();
}

class _MapWidgetState extends State<MapWidget> {
  late fm.MapController _fmMapCtrl;

  @override
  void initState() {
    super.initState();
    _fmMapCtrl = fm.MapController();
    widget.controller.addListener(_onChange);
    widget.controller.onMapReady(_fmMapCtrl);
  }

  @override
  void didUpdateWidget(covariant MapWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller) {
      oldWidget.controller.removeListener(_onChange);
      widget.controller.addListener(_onChange);
    }
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onChange);
    super.dispose();
  }

  void _onChange() { if (mounted) setState(() {}); }

  void _onMapEvent(fm.MapEvent e) {
    if (e is fm.MapEventMoveEnd || e is fm.MapEventFlingAnimationEnd) {
      widget.controller.onZoomChanged(_fmMapCtrl.camera.zoom);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ctrl = widget.controller;
    return fm.FlutterMap(
      mapController: _fmMapCtrl,
      options: fm.MapOptions(
        initialCenter: const LatLng(31.565, 74.314),
        initialZoom: 12,
        backgroundColor: ctrl.theme == 'dark' ? const Color(0xFF1A1A1A) : const Color(0xFFF4F3F0),
        onMapEvent: _onMapEvent,
        onTap: (tapPos, ll) {
          ctrl.setSelPin(ll.latitude, ll.longitude, 'Dropped Pin');
          ctrl.onMapTap?.call({'lat': ll.latitude, 'lng': ll.longitude});
        },
      ),
      children: [
        fm.PolylineLayer(polylines: ctrl.roads),
        if (ctrl.placeMarkers.isNotEmpty) fm.MarkerLayer(markers: ctrl.placeMarkers),
        if (ctrl.roadLabels.isNotEmpty) fm.MarkerLayer(markers: ctrl.roadLabels),
        fm.MarkerLayer(markers: ctrl.poiMarkers),
        if (ctrl.selMarker != null) fm.MarkerLayer(markers: [ctrl.selMarker!]),
        if (ctrl.userMarker != null) fm.MarkerLayer(markers: [ctrl.userMarker!]),
        if (ctrl.routeLine != null) fm.PolylineLayer(polylines: [ctrl.routeLine!]),
        if (ctrl.routeMarkers.isNotEmpty) fm.MarkerLayer(markers: ctrl.routeMarkers),
      ],
    );
  }
}
