#!/usr/bin/perl
# aleph-merge-plus-ui
# 
# Copyright (C) 2015-2017 University Of Helsinki (The National Library Of Finland)
# 
# This file is part of aleph-merge-plus-ui
# 
# aleph-merge-plus-ui program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
# 
# aleph-merge-plus-ui is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
# 
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
# 
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

