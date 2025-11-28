import UIKit
import Capacitor

struct APIConfig {
    static let baseURL = URL(string: "http://127.0.0.1:8080")!
}

struct HealthResponse: Decodable {
    let status: String
}

final class HealthService {
    static let shared = HealthService()
    private let session: URLSession

    private init(session: URLSession = .shared) {
        self.session = session
    }

    func testBackendConnection() {
        let url = APIConfig.baseURL.appendingPathComponent("api/health")
        let request = URLRequest(url: url, timeoutInterval: 5)

        session.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Health check failed: \(error.localizedDescription)")
                return
            }

            guard let http = response as? HTTPURLResponse else {
                print("Health check failed: no HTTPURLResponse")
                return
            }

            guard (200...299).contains(http.statusCode) else {
                print("Health check failed: status \(http.statusCode)")
                return
            }

            guard let data = data else {
                print("Health check failed: no data")
                return
            }

            do {
                let decoded = try JSONDecoder().decode(HealthResponse.self, from: data)
                print("Health check success: status=\(decoded.status)")
            } catch {
                print("Health check decode error: \(error.localizedDescription)")
            }
        }.resume()
    }
}

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        // Kick off a lightweight backend health check on launch.
        HealthService.shared.testBackendConnection()
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
        // Safe to call multiple times as the request is lightweight.
        HealthService.shared.testBackendConnection()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
