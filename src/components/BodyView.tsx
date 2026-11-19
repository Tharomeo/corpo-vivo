import { forwardRef, useImperativeHandle, useRef, type ComponentType, type Ref } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewProps } from 'react-native-webview';
import { BODY_HTML } from '../three/bodyScene';
import type { BodyViewHandle, BodyViewProps } from './bodyViewTypes';

// Os tipos da react-native-webview fazem WebViewProps & undefined = never com o TS atual.
// Este alias corrige só a tipagem; o componente é o mesmo.
type WebViewInstance = { injectJavaScript: (js: string) => void };
const SafeWebView = WebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebViewInstance> }>;

// Versão celular: a cena three.js roda dentro de uma WebView.
export const BodyView = forwardRef<BodyViewHandle, BodyViewProps>(function BodyView({ onMessage }, ref) {
  const web = useRef<WebViewInstance>(null);

  useImperativeHandle(ref, () => ({
    run(js: string) {
      web.current?.injectJavaScript(`try { ${js} } catch (e) {} true;`);
    },
  }));

  return (
    <SafeWebView
      ref={web}
      source={{ html: BODY_HTML, baseUrl: 'https://localhost/' }}
      originWhitelist={['*']}
      style={styles.web}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
      onMessage={(e: WebViewMessageEvent) => {
        try {
          onMessage(JSON.parse(e.nativeEvent.data));
        } catch {}
      }}
    />
  );
});

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: 'transparent' },
});
