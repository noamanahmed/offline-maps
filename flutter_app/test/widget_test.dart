import 'package:flutter_test/flutter_test.dart';
import 'package:pakistan_offline_map_explorer/main.dart';

void main() {
  testWidgets('OfflineMapApp smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const OfflineMapApp());

    // Verify widget tree pumped successfully without throwing
    expect(find.byType(OfflineMapApp), findsOneWidget);
  });
}
