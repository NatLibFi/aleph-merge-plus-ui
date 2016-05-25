#!/usr/bin/perl

use warnings;
use strict;

use CGI;
use Log::TinyLogger;

my $query = CGI->new;

print "Content-Type: text/html\n\n";


my $log = Log::TinyLogger->new("logs/uilog.txt");

if (!defined($log)) {
  print "Error, see apache error log.";
  return;
}


if (defined($query->url_param('line'))) {
  $log->write($query->url_param('line'));
  print 1;
} else {
  print 0;
}

