import 'package:flutter_test/flutter_test.dart';
import 'package:pakistan_offline_map_explorer/services/map_parser.dart';

void main() {
  test('parseMapData throws when file does not exist', () async {
    expect(
      () => parseMapData('non_existent_file.mbtiles', '[]'),
      throwsA(anything),
    );
  });
}
