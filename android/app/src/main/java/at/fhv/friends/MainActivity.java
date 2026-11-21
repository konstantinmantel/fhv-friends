package at.fhv.friends;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

/** URL wrapper: application code and content are served by the existing HTTPS PWA. */
public final class MainActivity extends Activity {
 private static final String APP_URL = "https://konstantinmantel.github.io/fhv-friends/";
 private static final int PICK_PHOTO = 42;
 private WebView web;
 private FrameLayout root;
 private ProgressBar progress;
 private LinearLayout errorView;
 private ValueCallback<Uri[]> photoCallback;
 private boolean failed;

 @Override @SuppressLint("SetJavaScriptEnabled")
 protected void onCreate(Bundle saved) {
  super.onCreate(saved);
  root = new FrameLayout(this);
  root.setBackgroundColor(Color.rgb(246,247,248));
  root.setOnApplyWindowInsetsListener((view,insets) -> {
   view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());
   return insets.consumeSystemWindowInsets();
  });
  web = new WebView(this);
  root.addView(web,new FrameLayout.LayoutParams(-1,-1));
  progress = new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
  root.addView(progress,new FrameLayout.LayoutParams(-1,dp(3),Gravity.TOP));
  setContentView(root);
  WebSettings settings = web.getSettings();
  settings.setJavaScriptEnabled(true);
  settings.setDomStorageEnabled(true);
  settings.setAllowFileAccess(false);
  settings.setAllowContentAccess(true); // Only files explicitly chosen through the system picker.
  settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  settings.setMediaPlaybackRequiresUserGesture(true);
  settings.setSafeBrowsingEnabled(true);
  settings.setUserAgentString(settings.getUserAgentString()+" FHVFriendsWrapper/1.1");
  CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
  WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
  web.setWebViewClient(new WebViewClient() {
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request) {
    if(!request.isForMainFrame()) return false;
    Uri uri=request.getUrl();
    if(isInternal(uri)) return false;
    if(request.hasGesture() && ("https".equals(uri.getScheme())||"mailto".equals(uri.getScheme())||"tel".equals(uri.getScheme()))) {
     try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); } catch(ActivityNotFoundException ignored) {}
    }
    return true;
   }
   @Override public void onPageStarted(WebView view,String url,android.graphics.Bitmap favicon) {
    failed=false;
    progress.setVisibility(View.VISIBLE);
   }
   @Override public void onPageFinished(WebView view,String url) {
    progress.setVisibility(View.GONE);
    if(!failed && errorView!=null) { root.removeView(errorView);errorView=null;web.setVisibility(View.VISIBLE); }
   }
   @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error) {
    if(request.isForMainFrame()) showError();
   }
   @Override public void onReceivedSslError(WebView view,SslErrorHandler handler,SslError error) {
    handler.cancel();showError();
   }
  });
  web.setWebChromeClient(new WebChromeClient() {
   @Override public void onProgressChanged(WebView view,int value) { progress.setProgress(value); }
   @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params) {
    if(photoCallback!=null) photoCallback.onReceiveValue(null);
    photoCallback=callback;
    Intent pick=new Intent(Intent.ACTION_GET_CONTENT);
    pick.addCategory(Intent.CATEGORY_OPENABLE);
    pick.setType("image/*");
    pick.putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"image/jpeg","image/png","image/webp"});
    try { startActivityForResult(Intent.createChooser(pick,"Foto auswählen"),PICK_PHOTO); }
    catch(ActivityNotFoundException error) { photoCallback.onReceiveValue(null);photoCallback=null; }
    return true;
   }
  });
  web.setDownloadListener((url,userAgent,contentDisposition,mimetype,length)->{
   if(url.startsWith("https://")) { try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url)));}catch(ActivityNotFoundException ignored){} }
   else Toast.makeText(this,"Für Kalenderexport bitte die Web-App im Browser öffnen.",Toast.LENGTH_LONG).show();
  });
  if(saved==null || web.restoreState(saved)==null) web.loadUrl(APP_URL);
 }
 private boolean isInternal(Uri uri) {
  String path=uri.getPath();String encoded=uri.getEncodedPath();
  return "https".equals(uri.getScheme()) && "konstantinmantel.github.io".equals(uri.getHost()) && (uri.getPort()==-1||uri.getPort()==443)
   && path!=null && (path.equals("/fhv-friends")||path.startsWith("/fhv-friends/"))
   && !path.contains("/../") && (encoded==null||!encoded.toLowerCase(java.util.Locale.ROOT).contains("%2e"));
 }
 private void showError() {
  failed=true;progress.setVisibility(View.GONE);web.setVisibility(View.INVISIBLE);
  if(errorView!=null) return;
  errorView=new LinearLayout(this);errorView.setOrientation(LinearLayout.VERTICAL);errorView.setGravity(Gravity.CENTER);errorView.setPadding(dp(28),dp(28),dp(28),dp(28));
  TextView message=new TextView(this);message.setText("FHV Friends konnte nicht geladen werden. Bitte Internetverbindung prüfen.");message.setTextSize(17);message.setGravity(Gravity.CENTER);
  errorView.addView(message);
  Button retry=new Button(this);retry.setText("Erneut versuchen");retry.setOnClickListener(v->{root.removeView(errorView);errorView=null;web.setVisibility(View.VISIBLE);web.loadUrl(APP_URL);});errorView.addView(retry);
  root.addView(errorView,new FrameLayout.LayoutParams(-1,-1));
 }
 @Override protected void onActivityResult(int request,int result,Intent data) {
  super.onActivityResult(request,result,data);
  if(request!=PICK_PHOTO||photoCallback==null)return;
  Uri uri=result==RESULT_OK&&data!=null?data.getData():null;
  boolean accepted=false;
  if(uri!=null && "content".equals(uri.getScheme())) {
   String mime=getContentResolver().getType(uri);
   accepted="image/jpeg".equals(mime)||"image/png".equals(mime)||"image/webp".equals(mime);
  }
  photoCallback.onReceiveValue(accepted?new Uri[]{uri}:null);photoCallback=null;
 }
 @Override public void onBackPressed() {
  web.evaluateJavascript("Boolean(document.querySelector('[role=dialog]'))",result->{
   if("true".equals(result))web.evaluateJavascript("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))",null);
   else if(web.canGoBack())web.goBack();else finish();
  });
 }
 @Override protected void onSaveInstanceState(Bundle out) { web.saveState(out);super.onSaveInstanceState(out); }
 @Override protected void onDestroy() { if(photoCallback!=null)photoCallback.onReceiveValue(null);if(web!=null)web.destroy();super.onDestroy(); }
 private int dp(int value) { return Math.round(value*getResources().getDisplayMetrics().density); }
}
