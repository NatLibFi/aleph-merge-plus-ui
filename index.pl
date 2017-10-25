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
use strict;
use DBI;
use LWP::Simple qw(!head);
use HTTP::Request::Common;
use CGI qw(:standard);
use Cwd 'abs_path';
use File::Basename qw(dirname);
use Fcntl;
use Switch;

use Aleph::XSession 1.04; #X-server session. 
use HTML::Template;
use JSON;

my $cmd_path = dirname(abs_path($0));

my $session = new Aleph::XSession(do("protected/config/X_config.pl"));


sub show_login;
sub show_mainview();
sub action_login();
sub action_logout();

#helpers
sub removeParenthesis($);
sub fail;

# MAIN
{

	my $action = param('action');

	show_login() unless defined($action);

	if (!$session->load()) {
		if (defined($action) && $action ne 'login') {
			fail("Istunto on vanhentunut. <a href=\"index.pl\">Kirjaudu uudelleen</a>");
		}
	}
			
		
	
	
	switch($action) {
	
			case "login" {
				action_login();
			}
			
			case "main" {
				show_mainview();
			}
			
			case "logout" {
				action_logout();
				show_login("Uloskirjautuminen onnistui.");
			}
	}
	
	
}

# Views
# Param: Additional message shown in the login page.
sub show_login {
	my %params = (
		title => "Linda - Merge+ - Sisäänkirjautuminen",

	);
	if (length(@_) > 0) {
		$params{'message'} = shift;
	}

	render("protected/templates/login.tmpl",
	{
		data=>\%params,
	});
}

# ajax-powered mainview, the javascript in it makes calls to the backend.
sub show_mainview() {

	my %params = (
		 title => "Linda - Merge+"
    ,user => $session->getUser()
    ,pass => $session->getUserPass()
	);

	render("protected/templates/mainview.tmpl",
	{
		data=>\%params,
	});
}



# Actions

sub action_login() {

	my $cookie = $session->start(param("username"),param("password"))
		or printJSON(0,$session->{'errormsg'});
		
	my $cookieRef = {'name'=>$cookie->name(),'value'=>$cookie->value(),'path'=>'/'};

	printJSON(1,$cookieRef);
	
}

sub action_logout() {

	$session->end();

}


# Renders a template.
#
# Params: $templatefile, \%variables
#
# *optional* variables:
# data => should be a reference to template data hash.
# templateParams => should be a reference to templateparameters hash.
# noheader => don't send headers.
# headers => should be a reference to custom headers.
# return => instead of printing the data, return it. 
#
# if noheader or headers are not used, then default headers are sent.
sub render {

	my $filename = shift;
	if (!defined($filename)) {
		die("render(): one parameter (the filename) is required.");
	}
	my ($args) = shift;

	my %templateParams = (
		filename => $filename
	);

	
	if (defined($args->{'templateParams'})) {
		%templateParams = (%templateParams, %{$args->{'templateParams'}}); 
	}
	
	my $template = HTML::Template->new(%templateParams);
	

	if (defined($args->{'data'})) {
		$template->param($args->{'data'});
	}
	
	if (!defined($args->{'noheaders'})) {
	
		# send headers
		if (defined($args->{'headers'})) {
			my $cgi = new CGI;
			print $cgi->header($args->{'headers'});
	
		} else {
	
			my $cgi = new CGI;
			print $cgi->header(
				-type => 'text/html',
				-charset => 'UTF-8',
			);
		}
	}
	
	if (!defined($args->{'return'})) {
		print	$template->output;
	} else {
		return $template->output;
	}
}


# Prints JSON message used by actions.
sub printJSON {

	my ($success,$message,$no_utf8) = @_;
	
	$success = $success eq 1 ? "true" : "false";
	
	if (defined($no_utf8) && $no_utf8) {
		$message = JSON->new->allow_nonref->pretty->encode($message);	
	} else {
		$message = JSON->new->allow_nonref->utf8->pretty->encode($message);
	}
	
		my $cgi = new CGI;
		print $cgi->header(
			-type => 'application/x-javascript',
			-charset => 'UTF-8',
		);
		
		
		print <<RESPONSE;
{
"success": $success,
"message": $message
}
RESPONSE

  #
	exit(0);
}

sub removeParenthesis($)
{
	my $string = shift;
	$string =~ s/^\s*\(//;
	$string =~ s/\)\s*$//;
	return $string;
}

sub fail($) {

		my $cgi = new CGI;
		print $cgi->header(
			-type => 'text/html',
			-charset => 'UTF-8',
		);
		
		
		print shift;
		
	exit(0)
}
