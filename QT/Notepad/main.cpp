#include <QtGui>
#include "notepad.h"

int main (int argv, char **args)
{
	QApplication app(argv, args);
    
    Notepad *notepad = new Notepad();
    notepad->show();

	return app.exec();
}
