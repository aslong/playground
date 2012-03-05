#include <QApplication>
#include <QWebView>
#include <QUrl>

int main (int argc, char **argv)
{
    QApplication app(argc, argv);

    QWebView *view = new QWebView();
    view->load(QUrl("http://www.webstandards.org/files/acid2/test.html"));
    view->show();

    return app.exec();
}
