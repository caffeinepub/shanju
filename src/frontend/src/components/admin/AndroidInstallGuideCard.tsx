import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Download, Info, CheckCircle2 } from 'lucide-react';
import { usePwaInstallPrompt } from '../../hooks/usePwaInstallPrompt';

export default function AndroidInstallGuideCard() {
  const { isInstallable, promptInstall, isInstalled } = usePwaInstallPrompt();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle>Install Admin Panel on Android</CardTitle>
          </div>
          <CardDescription>
            Get app-like access to the Shanju Admin Panel on your Android device without needing an APK file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isInstalled && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                The Admin Panel is already installed on this device.
              </AlertDescription>
            </Alert>
          )}

          {isInstallable && !isInstalled && (
            <div className="space-y-3">
              <Alert className="border-primary/20 bg-primary/5">
                <Download className="h-4 w-4 text-primary" />
                <AlertDescription>
                  The Admin Panel is ready to install on your device!
                </AlertDescription>
              </Alert>
              <Button onClick={promptInstall} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" />
                Install Admin Panel Now
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-base">How to Install (Chrome/Edge):</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Open this Admin Panel in Chrome or Edge browser on your Android device</li>
              <li>Tap the menu icon (three dots ⋮) in the top-right corner</li>
              <li>Select <strong className="text-foreground">"Add to Home screen"</strong> or <strong className="text-foreground">"Install app"</strong></li>
              <li>Confirm the installation when prompted</li>
              <li>Launch the Admin Panel from your home screen like any other app</li>
            </ol>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> This installation method is the supported alternative to an APK file. 
              It provides the same app-like experience without requiring Google Play Store distribution.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-base">Benefits of Installing:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Launch the Admin Panel directly from your home screen</li>
              <li>Full-screen experience without browser navigation bars</li>
              <li>Faster loading times and improved performance</li>
              <li>Works like a native app on your device</li>
              <li>Automatic updates when you're online</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
