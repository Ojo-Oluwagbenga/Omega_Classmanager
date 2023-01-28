import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
// ignore: depend_on_referenced_packages
import 'package:webview_flutter_plus/webview_flutter_plus.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.green,
      ),
      home: MyHomePage(
        title: 'Flutter Demo Homehjhg Page',
      ),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  // int _counter = 0;

  late WebViewPlusController controller;

  final html = '''
    <!DOCTYPE html>
    <html>
      <body style="background-color:yellow">
        <div style="font-size:100px" >Hey see t</div>
      
      </body>
    </html>
  ''';

  void loadLocalHtml() async {
    final html = await rootBundle.loadString('assets/index.html');
    final url = Uri.dataFromString(
      html,
      mimeType: 'text/html',
      encoding: Encoding.getByName('utf-8'),
    ).toString();

    controller.loadUrl(url);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          // Here we take the value from the MyHomePage object that was created by
          // the App.build method, and use it to set our appbar title.
          title: Text(widget.title),
        ),
        body: WebViewPlus(
          javascriptMode: JavascriptMode.unrestricted,
          initialUrl: 'https://facebook.com',
          onWebViewCreated: (controller) {
            this.controller = controller;

            // loadLocalHtml();
          },
          // javascriptChannels: {
          //   JavascriptChannel(
          //     name: 'mjsc',
          //     onMessageReceived: (message) async {
          //       print(message.message);

          //       controller.webViewController.runJavascript('pop()');
          //     },
          //   )
          // },
        ));
  }
}
