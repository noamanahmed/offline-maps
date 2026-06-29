import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:offline_maps/models/place.dart';
import 'package:offline_maps/services/file_loader.dart';
import 'package:offline_maps/services/gps_service.dart';
import 'package:offline_maps/services/storage_service.dart';
import 'package:offline_maps/services/map_parser.dart';
import 'package:offline_maps/widgets/map_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final StorageService _storage = StorageService();
  final FileLoader _loader = FileLoader();
  final GpsService _gps = GpsService();

  final MapController _mapCtrl = MapController();

  String _theme = 'light';
  int _poiCount = 0;
  bool _isLoadingPlace = false;

  Place? _currentPlace;
  List<Place> _placesIndex = [];
  List<String> _countries = [];

  bool _gpsConnected = false;
  String _gpsAccuracy = '';
  bool _isLocating = false;
  double? _userLat, _userLng;

  String? _errorMsg;

  Map<String, dynamic>? _selectedDetails;
  Map<String, dynamic>? _routeInfo;

  bool _showSearch = false;
  final _searchCtrl = TextEditingController();
  List<Map<String, dynamic>> _searchResults = [];
  Map<String, dynamic>? _selectedResult;

  bool _showWizard = false;
  bool _showLocationChanger = false;
  bool _showSettings = false;
  int _wizardStep = 1;
  String? _wizardCountry, _wizardProvince;
  String _wizardType = 'city';
  Place? _wizardPlace;

  final _changerCtrl = TextEditingController();
  Place? _changerPlace;
  List<Place> _changerResults = [];
  List<Place> _recentPlaces = [];

  final _wizardSearchCtrl = TextEditingController();
  String _wizardSearchQuery = '';

  StreamSubscription? _gpsLocSub, _gpsErrSub;

  @override
  void initState() {
    super.initState();
    _theme = _storage.getString('theme', defaultValue: 'light');
    final hasWizard = _storage.getBool('wizard_completed');
    _showWizard = !hasWizard;
    _loadPlacesIndex();
    _loadRecentPlaces();
    _startGps();
    _wireMapCallbacks();
  }

  void _wireMapCallbacks() {
    _mapCtrl.onMapLoaded = (poiCount) {
      if (!mounted) return;
      setState(() {
        _poiCount = poiCount;
        _isLoadingPlace = false;
      });
    };
    _mapCtrl.onPoiSelected = (data) {
      if (!mounted) return;
      setState(() {
        _selectedDetails = {
          'type': 'poi',
          'name': data['name'] ?? '',
          'category': data['category'] ?? '',
          'subcategory': data['subcategory'] ?? '',
          'lat': data['latitude'] ?? 0,
          'lon': data['longitude'] ?? 0,
        };
      });
    };
    _mapCtrl.onMapTap = (data) {
      if (!mounted) return;
      setState(() {
        _selectedDetails = {
          'type': 'dropped-pin',
          'name': 'Dropped Pin',
          'lat': data['lat'] ?? 0,
          'lon': data['lng'] ?? 0,
        };
      });
    };
    _mapCtrl.onRouteDrawn = (data) {
      if (!mounted) return;
      setState(() => _routeInfo = {'distance': data['distance'] ?? ''});
    };
    _mapCtrl.onSearchResults = (results) {
      if (!mounted) return;
      setState(() => _searchResults = results);
    };
  }

  Future<void> _loadPlacesIndex() async {
    final json = await _loader.readText('places_index.json');
    if (json == null) return;
    try {
      final List<dynamic> data = jsonDecode(json);
      if (!mounted) return;
      setState(() {
        _placesIndex = data.map((d) => Place.fromJson(d as Map<String, dynamic>)).toList();
        _countries = _placesIndex.map((p) => p.country).toSet().toList()..sort();
      });
    } catch (_) {}
  }

  void _startGps() {
    _gpsLocSub = _gps.onLocation.listen((loc) {
      _storage.setDouble('last_lat', loc.lat);
      _storage.setDouble('last_lng', loc.lng);
      _mapCtrl.updateUserLocation(loc.lat, loc.lng, true);
      if (!mounted) return;
      setState(() {
        _gpsConnected = true;
        _gpsAccuracy = '${loc.accuracy.toStringAsFixed(1)}m';
        _userLat = loc.lat;
        _userLng = loc.lng;
        _isLocating = false;
      });
    });
    _gpsErrSub = _gps.onError.listen((_) {
      final lastLat = _storage.getDouble('last_lat');
      final lastLng = _storage.getDouble('last_lng');
      if (lastLat != 0 && lastLng != 0) {
        _mapCtrl.updateUserLocation(lastLat, lastLng, false);
      }
      if (!mounted) return;
      setState(() {
        _gpsConnected = false;
        _isLocating = false;
      });
    });
    _gps.start();
  }

  void _loadSavedPlace() {
    final path = _storage.getString('saved_path');
    if (path.isEmpty) return;
    final place = Place(
      id: _storage.getInt('saved_id'),
      name: _storage.getString('saved_name'),
      type: _storage.getString('saved_type', defaultValue: 'city'),
      lat: _storage.getDouble('saved_lat'),
      lon: _storage.getDouble('saved_lon'),
      province: _storage.getString('saved_province'),
      country: _storage.getString('saved_country'),
      path: path,
    );
    _doLoadPlace(place);
  }

  Future<void> _doLoadPlace(Place place) async {
    _isLoadingPlace = true;
    setState(() {
      _currentPlace = place;
      _selectedDetails = null;
      _errorMsg = null;
    });
    _savePlace(place);

    try {
      final pbf = await _loader.readBinary(place.pbfPath);
      if (pbf == null) throw Exception('Failed to load PBF file: ${place.pbfPath}');

      final pois = await _loader.readText(place.poisPath);
      if (pois == null) throw Exception('Failed to load POIs file: ${place.poisPath}');

      print('[home_screen] Loading: ${place.name} (${place.type}), path: ${place.path}');
      print('[home_screen] PBF size: ${pbf.length} bytes, POIs JSON size: ${pois.length} chars');

      final parsed = await parseMapData(pbf, pois);
      if (!mounted) return;

      print('[home_screen] Parsed — nodes: ${parsed.nodes.length}, ways: ${parsed.ways.length}, pois: ${parsed.pois.length}');

      await _mapCtrl.loadParsedData(parsed, place.lat, place.lon, 14);
    } catch (e, st) {
      print('[home_screen] ERROR loading map: $e');
      print('[home_screen] $st');
      _isLoadingPlace = false;
      if (mounted) {
        setState(() => _errorMsg = '$e');
      }
    }
  }

  void _savePlace(Place place) {
    _storage.setBool('wizard_completed', true);
    _storage.setString('saved_country', place.country);
    _storage.setString('saved_province', place.province);
    _storage.setString('saved_type', place.type);
    _storage.setString('saved_path', place.path);
    _storage.setString('saved_name', place.name);
    _storage.setDouble('saved_lat', place.lat);
    _storage.setDouble('saved_lon', place.lon);
    _storage.setInt('saved_id', place.id);
    _addRecentPlace(place);
  }

  void _addRecentPlace(Place place) {
    final recent = _recentPlaces.where((p) => p.id != place.id).toList();
    recent.insert(0, place);
    if (recent.length > 3) recent.removeLast();
    _recentPlaces = recent;
    _storage.setString('recent_places', jsonEncode(recent.map((p) => {
      'id': p.id, 'name': p.name, 'type': p.type,
      'lat': p.lat, 'lon': p.lon,
      'province': p.province, 'country': p.country,
      'path': p.path,
    }).toList()));
  }

  void _loadRecentPlaces() {
    final json = _storage.getString('recent_places');
    if (json.isEmpty) return;
    try {
      final List<dynamic> data = jsonDecode(json);
      _recentPlaces = data.map((d) => Place.fromJson(d as Map<String, dynamic>, path: d['path'] as String? ?? '')).toList();
    } catch (_) {}
  }

  void _toggleTheme() {
    final t = _theme == 'light' ? 'dark' : 'light';
    _storage.setString('theme', t);
    _mapCtrl.setTheme(t);
    setState(() => _theme = t);
  }

  void _onSearchChanged(String q) {
    if (q.trim().length < 2) {
      setState(() => _searchResults = []);
      return;
    }
    Future.delayed(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      final aLat = _userLat ?? _currentPlace?.lat ?? 31.565;
      final aLng = _userLng ?? _currentPlace?.lon ?? 74.314;
      _mapCtrl.runSearch(q, aLat, aLng);
    });
  }

  @override
  void dispose() {
    _gpsLocSub?.cancel();
    _gpsErrSub?.cancel();
    _gps.dispose();
    _searchCtrl.dispose();
    _changerCtrl.dispose();
    _wizardSearchCtrl.dispose();
    _mapCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F3F0),
      body: Stack(
        children: [
          if (!_showWizard)
            Positioned.fill(
              child: MapWidget(controller: _mapCtrl),
            ),
          if (!_showWizard) ...[
            _buildTopBar(),
            _buildFabLeft(),
            _buildFabRight(),
            if (_routeInfo != null) _buildRouteBanner(),
            if (_selectedDetails != null) _buildBottomPanel(),
          ],
          if (_showWizard) _buildWizard(),
          if (_showLocationChanger) _buildLocationChanger(),
          if (_showSearch) _buildSearchOverlay(),
          if (_isLoadingPlace) _buildLoadingOverlay(),
          if (_errorMsg != null) _buildErrorBanner(),
        ],
      ),
    );
  }

  Widget _buildErrorBanner() {
    return Positioned(
      top: 12, left: 12, right: 12,
      child: SafeArea(
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFEA4335),
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 8)],
          ),
          child: Row(
            children: [
              const Icon(Icons.error_outline, color: Colors.white, size: 24),
              const SizedBox(width: 12),
              Expanded(
                child: Text(_errorMsg ?? 'An error occurred',
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
              ),
              GestureDetector(
                onTap: () => setState(() => _errorMsg = null),
                child: const Icon(Icons.close, color: Colors.white, size: 20),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Positioned(
      top: 0, left: 0, right: 0,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              GestureDetector(
                onTap: () => setState(() {
                  _showSearch = true;
                  _searchCtrl.clear();
                  _searchResults = [];
                  _selectedResult = null;
                }),
                child: Container(
                  width: 44, height: 44,
                  decoration: const BoxDecoration(
                    color: Colors.white, shape: BoxShape.circle,
                    boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
                  ),
                  child: const Icon(Icons.search, color: Color(0xFF1A73E8), size: 22),
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () => setState(() => _showSettings = !_showSettings),
                child: Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: _showSettings ? const Color(0xFFE8F0FE) : Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
                  ),
                  child: const Icon(Icons.settings, color: Color(0xFF5F6368), size: 22),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingOverlay() {
    return Positioned.fill(
      child: Container(
        color: Colors.black.withOpacity(0.3),
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 48, height: 48,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF1A73E8)),
                ),
              ),
              SizedBox(height: 16),
              Text('Loading map...',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              SizedBox(height: 4),
              Text('This may take a few moments',
                  style: TextStyle(color: Color(0xBBFFFFFF), fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFabLeft() {
    return Positioned(
      left: 12,
      top: MediaQuery.of(context).size.height / 2 - 56,
      child: Column(
        children: [
          _fabBtn(Icons.map, const Color(0xFF1A73E8), () => setState(() {
            _showLocationChanger = true;
            _changerCtrl.clear();
            _changerPlace = null;
            _changerResults = [];
          })),
          const SizedBox(height: 8),
          _fabBtn(Icons.screen_rotation, const Color(0xFF5F6368), () {}),
        ],
      ),
    );
  }

  Widget _buildFabRight() {
    return Positioned(
      right: 12,
      top: MediaQuery.of(context).size.height / 2 - 56,
      child: Column(
        children: [
          _fabBtn(
            _theme == 'light' ? Icons.dark_mode : Icons.light_mode,
            Colors.purple,
            _toggleTheme,
          ),
          const SizedBox(height: 8),
          _fabBtn(Icons.my_location, _isLocating ? const Color(0xFF34A853) : const Color(0xFF1A73E8), () {
            setState(() => _isLocating = true);
            _gps.start();
            _mapCtrl.centerOnUser();
          }),
        ],
      ),
    );
  }

  Widget _fabBtn(IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 48, height: 48,
        decoration: BoxDecoration(
          color: Colors.white, shape: BoxShape.circle,
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2))],
        ),
        child: Icon(icon, color: color, size: 22),
      ),
    );
  }

  Widget _buildRouteBanner() {
    return Positioned(
      top: 70, left: 12, right: 12,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF1A73E8),
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 8)],
        ),
        child: Row(
          children: [
            const Text('📡', style: TextStyle(fontSize: 16)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Distance: ${_routeInfo!['distance']}',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  const Text('Straight-line route',
                      style: TextStyle(color: Color(0xFFBBDEFB), fontSize: 11)),
                ],
              ),
            ),
            GestureDetector(
              onTap: () { _mapCtrl.clearRoute(); setState(() => _routeInfo = null); },
              child: const Icon(Icons.close, color: Colors.white, size: 20),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomPanel() {
    return Positioned(
      bottom: 0, left: 0, right: 0,
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 16, offset: Offset(0, -4))],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(width: 48, height: 4,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Text(_selectedDetails!['name'] ?? '',
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                ),
                GestureDetector(
                  onTap: () => setState(() => _selectedDetails = null),
                  child: Container(width: 32, height: 32,
                      decoration: BoxDecoration(color: Colors.grey.shade100, shape: BoxShape.circle),
                      child: const Icon(Icons.close, size: 16, color: Colors.grey)),
                ),
              ],
            ),
            if (_selectedDetails!['type'] == 'poi')
              Text('${_selectedDetails!['category']} · ${_selectedDetails!['subcategory']}',
                  style: const TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 4),
            Text('Lat: ${(_selectedDetails!['lat'] as num).toStringAsFixed(5)} | Lon: ${(_selectedDetails!['lon'] as num).toStringAsFixed(5)}',
                style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
            const SizedBox(height: 12),
            Row(
              children: [
                _actionBtn('🚙 Directions'),
                const SizedBox(width: 8),
                _actionBtn('📂 Save'),
                const SizedBox(width: 8),
                _actionBtn('🔗 Share'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _actionBtn(String label) {
    return GestureDetector(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: label.startsWith('🚙') ? const Color(0xFF1A73E8) : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(label, style: TextStyle(
          color: label.startsWith('🚙') ? Colors.white : Colors.grey.shade700,
          fontWeight: FontWeight.w600, fontSize: 12,
        )),
      ),
    );
  }

  List<Place> _filterWizardPlaces() {
    return _placesIndex.where((p) =>
        p.country == _wizardCountry &&
        p.province == _wizardProvince &&
        p.type == _wizardType).toList()..sort((a, b) => a.name.compareTo(b.name));
  }

  Widget _buildWizard() {
    return Container(
      color: const Color(0xFFF4F3F0),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 24),
              const Text('🗺️ Offline Map Explorer',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              const Text('Setup your offline area.',
                  style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(3, (i) => Container(
                  width: 48, height: 4, margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    color: _wizardStep > i ? const Color(0xFF1A73E8) : Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                )),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: _wizardStep == 1
                    ? ListView(
                        children: _countries.map((c) => ListTile(
                          title: Text(c, style: const TextStyle(fontWeight: FontWeight.w600)),
                          trailing: const Icon(Icons.chevron_right, color: Color(0xFF1A73E8)),
                          onTap: () {
                            setState(() { _wizardCountry = c; _wizardStep = 2; });
                          },
                        )).toList(),
                      )
                    : _wizardStep == 2
                        ? Column(
                            children: [
                              Text('Select Province of $_wizardCountry',
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 12),
                              Expanded(
                                child: () {
                                  final provs = _placesIndex
                                      .where((p) => p.country == _wizardCountry && p.province.isNotEmpty)
                                      .map((p) => p.province)
                                      .toSet()
                                      .toList();
                                  provs.sort();
                                  return ListView(
                                    children: provs.map((prov) => ListTile(
                                      title: Text(prov, style: const TextStyle(fontWeight: FontWeight.w600)),
                                      trailing: const Icon(Icons.chevron_right, color: Color(0xFF1A73E8)),
                                      onTap: () => setState(() { _wizardProvince = prov; _wizardStep = 3; _wizardSearchCtrl.clear(); _wizardSearchQuery = ''; }),
                                    )).toList(),
                                  );
                                }(),
                              ),
                              TextButton(onPressed: () => setState(() => _wizardStep = 1),
                                  child: const Text('↩ Back to Country')),
                            ],
                          )
                        : Column(
                            children: [
                              Text('Select City or Village in $_wizardProvince',
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 12),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                child: TextField(
                                  controller: _wizardSearchCtrl,
                                  decoration: InputDecoration(
                                    hintText: 'Search cities or villages...',
                                    prefixIcon: const Icon(Icons.search, color: Color(0xFF5F6368), size: 20),
                                    filled: true,
                                    fillColor: Colors.white,
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: Colors.grey.shade300),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: Colors.grey.shade300),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: Color(0xFF1A73E8)),
                                    ),
                                    suffixIcon: _wizardSearchQuery.isNotEmpty
                                        ? IconButton(
                                            icon: const Icon(Icons.clear, size: 18, color: Color(0xFF5F6368)),
                                            onPressed: () {
                                              _wizardSearchCtrl.clear();
                                              setState(() => _wizardSearchQuery = '');
                                            },
                                          )
                                        : null,
                                  ),
                                  onChanged: (q) => setState(() => _wizardSearchQuery = q.trim().toLowerCase()),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  _typeToggle('city', '🏙️ Cities'),
                                  const SizedBox(width: 8),
                                  _typeToggle('village', '🏡 Villages'),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Expanded(
                                child: ListView(
                                  children: _filterWizardPlaces()
                                      .where((p) => _wizardSearchQuery.isEmpty ||
                                          p.name.toLowerCase().contains(_wizardSearchQuery) ||
                                          p.nameUr.contains(_wizardSearchQuery))
                                      .map((p) => ListTile(
                                        title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                                        subtitle: p.nameUr.isNotEmpty ? Text(p.nameUr) : null,
                                        selected: _wizardPlace?.id == p.id,
                                        trailing: _wizardPlace?.id == p.id
                                            ? const Icon(Icons.check, color: Color(0xFF1A73E8))
                                            : null,
                                        onTap: () => setState(() => _wizardPlace = p),
                                      )).toList(),
                                ),
                              ),
                            ],
                          ),
              ),
              if (_wizardStep == 3)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => setState(() => _wizardStep = 2),
                          child: const Text('Back'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1A73E8),
                            foregroundColor: Colors.white,
                          ),
                          onPressed: _wizardPlace != null
                              ? () {
                                  _doLoadPlace(_wizardPlace!);
                                  setState(() => _showWizard = false);
                                }
                              : null,
                          child: const Text('Explore Offline Map'),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _typeToggle(String type, String label) {
    final active = _wizardType == type;
    return GestureDetector(
      onTap: () => setState(() => _wizardType = type),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: active ? Colors.white : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(label, style: TextStyle(
          color: active ? const Color(0xFF1A73E8) : Colors.grey.shade600,
          fontWeight: FontWeight.bold,
        )),
      ),
    );
  }

  Widget _buildLocationChanger() {
    final hasQuery = _changerCtrl.text.trim().length >= 2;
    List<Place> displayList;
    if (hasQuery) {
      final ql = _changerCtrl.text.toLowerCase();
      displayList = _placesIndex
          .where((p) => p.name.toLowerCase().contains(ql) || p.nameUr.contains(ql))
          .toList()..sort((a, b) => a.name.compareTo(b.name));
    } else {
      final recentIds = _recentPlaces.map((p) => p.id).toSet();
      final remaining = _placesIndex
          .where((p) => !recentIds.contains(p.id))
          .toList()..sort((a, b) => a.name.compareTo(b.name));
      displayList = [..._recentPlaces, ...remaining];
    }
    final recentIds = _recentPlaces.map((p) => p.id).toSet();

    return Container(
      color: const Color(0xFFF4F3F0),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 12, 12),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 8, offset: const Offset(0, 2))],
              ),
              child: Row(
                children: [
                  const Expanded(
                    child: Text('Change Map Area',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  ),
                  GestureDetector(
                    onTap: () => setState(() => _showLocationChanger = false),
                    child: Container(
                      width: 36, height: 36,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100, shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.close, size: 20, color: Color(0xFF5F6368)),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: TextField(
                controller: _changerCtrl,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Search city or village...',
                  prefixIcon: const Icon(Icons.search, color: Color(0xFF5F6368), size: 20),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF1A73E8)),
                  ),
                ),
                onChanged: (q) => setState(() {}),
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: displayList.length + (hasQuery ? 0 : (_recentPlaces.isNotEmpty ? 1 : 0)),
                itemBuilder: (context, index) {
                  final showRecentHeader = !hasQuery && _recentPlaces.isNotEmpty && index == 0;
                  if (showRecentHeader) {
                    return const Padding(
                      padding: EdgeInsets.fromLTRB(4, 12, 0, 4),
                      child: Row(
                        children: [
                          Icon(Icons.history, size: 14, color: Color(0xFF1A73E8)),
                          SizedBox(width: 6),
                          Text('Recent',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF1A73E8), letterSpacing: 0.5)),
                        ],
                      ),
                    );
                  }
                  final listIdx = hasQuery ? index : index - (_recentPlaces.isNotEmpty ? 1 : 0);
                  final p = displayList[listIdx];
                  final isRecent = recentIds.contains(p.id);
                  final isSelected = _changerPlace?.id == p.id;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 2),
                    child: Material(
                      color: isSelected ? const Color(0xFFE8F0FE) : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: () => setState(() => _changerPlace = p),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          child: Row(
                            children: [
                              Container(
                                width: 40, height: 40,
                                decoration: BoxDecoration(
                                  color: isRecent ? const Color(0xFFE8F0FE) : Colors.grey.shade100,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  isRecent ? Icons.history : Icons.place,
                                  size: 18,
                                  color: isRecent ? const Color(0xFF1A73E8) : const Color(0xFF5F6368),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(p.name,
                                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: isSelected ? const Color(0xFF1A73E8) : Colors.black87)),
                                    const SizedBox(height: 2),
                                    Text(
                                      p.nameUr.isNotEmpty ? p.nameUr : '${p.province}, ${p.country}',
                                      style: const TextStyle(fontSize: 12, color: Color(0xFF5F6368)),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: p.type == 'city' ? const Color(0xFFE8F0FE) : const Color(0xFFFFF3E0),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  p.type == 'city' ? 'City' : 'Village',
                                  style: TextStyle(
                                    fontSize: 10, fontWeight: FontWeight.w600,
                                    color: p.type == 'city' ? const Color(0xFF1A73E8) : const Color(0xFFE65100),
                                  ),
                                ),
                              ),
                              if (isSelected)
                                const Padding(
                                  padding: EdgeInsets.only(left: 8),
                                  child: Icon(Icons.check_circle, size: 20, color: Color(0xFF1A73E8)),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 8, offset: const Offset(0, -2))],
              ),
              child: SafeArea(
                top: false,
                child: SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _changerPlace != null ? const Color(0xFF1A73E8) : Colors.grey.shade300,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _changerPlace != null
                        ? () {
                            _doLoadPlace(_changerPlace!);
                            setState(() {
                              _showLocationChanger = false;
                              _changerPlace = null;
                              _changerCtrl.clear();
                              _changerResults = [];
                            });
                          }
                        : null,
                    child: const Text('Switch Map Area', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchOverlay() {
    return Container(
      color: const Color(0xFFF4F3F0),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                children: [
                  const Icon(Icons.search, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text('Search Places ($_poiCount Total Places)',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  ),
                  IconButton(
                    onPressed: () {
                      _searchCtrl.clear();
                      _searchResults = [];
                      _selectedResult = null;
                      setState(() => _showSearch = false);
                    },
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _searchCtrl,
                decoration: InputDecoration(
                  hintText: 'Search POIs, shops, roads...',
                  filled: true, fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                ),
                onChanged: _onSearchChanged,
              ),
              const SizedBox(height: 12),
              Expanded(
                child: _searchResults.isEmpty
                    ? const Center(child: Text('🗺️\n\nNo results found',
                        textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 16)))
                    : ListView(
                        children: _searchResults.map((r) => ListTile(
                          leading: Text(_searchEmoji(r), style: const TextStyle(fontSize: 20)),
                          title: Text(r['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Text('${r['category']} · ${r['subcategory']}${r['distance'] != null ? ' · ${(r['distance'] as num).toStringAsFixed(1)} km away' : ''}',
                              style: const TextStyle(color: Colors.grey, fontSize: 12)),
                          selected: _selectedResult?['id'] == r['id'],
                          trailing: _selectedResult?['id'] == r['id']
                              ? const Icon(Icons.check, color: Color(0xFF1A73E8))
                              : null,
                          onTap: () {
                            setState(() => _selectedResult = r);
                            _mapCtrl.focusPoi(
                              (r['latitude'] as num).toDouble(),
                              (r['longitude'] as num).toDouble(),
                              r['name'] ?? '',
                            );
                          },
                        )).toList(),
                      ),
              ),
              if (_selectedResult != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => setState(() => _showSearch = false),
                          child: const Text('📍 View on Map'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1A73E8),
                            foregroundColor: Colors.white,
                          ),
                          onPressed: () {
                            final dLat = _selectedResult!['latitude'] ?? 0;
                            final dLng = _selectedResult!['longitude'] ?? 0;
                            final sLat = _userLat ?? _currentPlace?.lat ?? 31.5;
                            final sLng = _userLng ?? _currentPlace?.lon ?? 74.3;
                            _mapCtrl.drawRoute(sLat, sLng, dLat, dLng);
                            setState(() => _showSearch = false);
                          },
                          child: const Text('🚨 Get Directions'),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  String _searchEmoji(Map<String, dynamic> r) {
    final c = r['category'] as String? ?? '';
    final s = r['subcategory'] as String? ?? '';
    if (c == 'road') return '🛣️';
    if (c == 'place') return s == 'city' ? '🏙️' : '🏡';
    if (s == 'restaurant' || s == 'fast_food') return '🍽️';
    if (s == 'hospital' || s == 'clinic') return '🏥';
    if (s == 'pharmacy') return '💊';
    if (s == 'cafe') return '☕';
    if (s == 'bank') return '🏦';
    if (s == 'fuel') return '⛽';
    if (c == 'shop') return '🛍️';
    if (s == 'school' || s == 'college' || s == 'university') return '🏫';
    return '📍';
  }
}
