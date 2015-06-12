package AlephRecord;

use strict;
use XML::DOM;

sub new($$)
{
  my ($class, $data_len, $data, $doc_number) = @_;

  my $this = {
    'doc_number' => $doc_number,
    'fieldlist' => build_field_list($data_len, $data),
  };
  bless $this, $class;
  return $this;
}

sub clone()
{
  my ($this) = @_;

  my $clone = (ref $this)->new();
  $clone->from_sequential($this->to_sequential());
  $clone;
}

sub get_doc_number()
{
  my ($this) = @_;

  return $this->{'doc_number'};
}

sub get_field_count($)
{
  my ($this, $a_field_code) = @_;

  my $count = 0;
  foreach my $field (@{$this->{'fieldlist'}})
  {
    ++$count if ($field->{'code'} =~ /^$a_field_code/);
  }
  return $count;
}

sub get_field_contents($$)
{
  my ($this, $a_field_code, $a_field_num) = @_;

  my $count = 0;
  foreach my $field (@{$this->{'fieldlist'}})
  {
    ++$count if ($field->{'code'} =~ /^$a_field_code/);
    return $field->{'contents'} if ($count == $a_field_num);
  }
  return '';
}

sub get_subfield_contents($$$)
{
  my ($this, $a_field_code, $a_field_num, $a_subfield) = @_;

  my $field = $this->get_field_contents($a_field_code, $a_field_num);
  return '' if (!$field);

  my @subfields = split(/\$\$/, $field);
  foreach my $subfield (@subfields)
  {
    return substr($subfield, 1) if (substr($subfield, 0, 1) eq $a_subfield);
  }
  return '';
}

sub delete_field($)
{
  my ($this, $a_field_code, $a_field_num) = @_;

  my @fieldlist;
  my $count = 0;
  foreach my $field (@{$this->{'fieldlist'}})
  {
    next if ($field->{'code'} =~ /^$a_field_code/ && ++$count == $a_field_num);
    push(@fieldlist, $field);
  }
  $this->{'fieldlist'} = \@fieldlist;
}

sub delete_fields($)
{
  my ($this, $a_field_code) = @_;

  my @fieldlist;
  foreach my $field (@{$this->{'fieldlist'}})
  {
    next if ($field->{'code'} =~ /^$a_field_code/);
    push(@fieldlist, $field);
  }
  $this->{'fieldlist'} = \@fieldlist;
}

sub change_field($$$$)
{
  my ($this, $a_field_code, $a_field_num, $a_indicators, $a_contents) = @_;

  my @fieldlist;
  my $count = 0;
  foreach my $field (@{$this->{'fieldlist'}})
  {
    if ($field->{'code'} =~ /^$a_field_code/ && ++$count == $a_field_num)
    {
      push(@fieldlist, { 'code' => $a_field_code, 'indicators' => $a_indicators, 'contents' => $a_contents});
    }
    else
    {
      push(@fieldlist, $field);
    }
  }
  $this->{'fieldlist'} = \@fieldlist;
}

sub add_field($$$)
{
  my ($this, $a_field_code, $a_indicators, $a_contents) = @_;

  push(@{$this->{'fieldlist'}}, { 'code' => $a_field_code, 'indicators' => $a_indicators, 'contents' => $a_contents});
}

sub get_field_data($$)
{
  my ($this, $a_field_code, $a_field_num) = @_;

  my $count = 0;
  foreach my $field (@{$this->{'fieldlist'}})
  {
    ++$count if ($field->{'code'} =~ /^$a_field_code/);
    return ($field->{'code'}, $field->{'indicators'}, $field->{'contents'}) if ($count == $a_field_num);
  }
  return (undef, undef, undef);
}

sub sort_fields()
{
  my ($this) = @_;

  my @fieldlist = sort {
    my $key1 = $a->{'code'};
    my $key2 = $b->{'code'};
    $key1 = '0000' if ($key1 eq 'FMT');
    $key1 = '0001' if ($key1 eq 'LDR');
    $key2 = '0000' if ($key2 eq 'FMT');
    $key2 = '0001' if ($key2 eq 'LDR');
    $key1 cmp $key2;
  } @{$this->{'fieldlist'}};
  $this->{'fieldlist'} = \@fieldlist;
}

sub to_sequential()
{
  my ($this) = @_;

  my $doc_number = $this->{'doc_number'};
  $doc_number = "0$doc_number" while(length($doc_number) < 9);
  my $sequential = '';
  foreach my $field (@{$this->{'fieldlist'}})
  {
    my $field_code = $field->{'code'};
    my $indicators = $field->{'indicators'};
    my $contents = $field->{'contents'};
    my $line = "$doc_number $field_code$indicators L $contents";
    $sequential .= "\n" if ($sequential);
    $sequential .= $line;
  }
  return $sequential;
}

sub to_html()
{
  my ($this) = @_;

  my $html = '';
  foreach my $field (@{$this->{'fieldlist'}})
  {
    my $field_code = $field->{'code'};
    my $indicators = $field->{'indicators'};
    my $contents = $field->{'contents'};

    next if ($field_code =~ /(CAT|EXT|OWN)/);

    $html .= "<span class='code'>$field_code</span> ";
    if ($field_code =~ /\d{3}/ && $field_code < 10)
    {
      $contents =~ s/ /&bull;/g;
      $html .= "<span class='field'>$contents</span><br/>\n";
    }
    else
    {
      $contents =~ s/\$\$(.)/<span class="sub">&Dagger;$1<\/span>/g;
      $indicators =~ s/ /_/g;
      $html .= "<span class='ind'>$indicators" .
        "</span> <span class='field'>" . $contents . "</span><br/>\n";
    }
  }

  return $html;
}

sub to_multiline_html() {

  my ($this) = @_;

  my $html = '';
  foreach my $field (@{$this->{'fieldlist'}})
  {
    my $field_code = $field->{'code'};
    my $indicators = $field->{'indicators'};
    my $contents = $field->{'contents'};

    next if ($field_code =~ /(CAT|EXT|OWN)/);

    $html .= "<span class='code'>$field_code</span> ";
    if ($field_code =~ /\d{3}/ && $field_code < 10)
    {
      $contents =~ s/ /&bull;/g;
      $html .= "<span class='field'>$contents</span><br/>\n";
    }
    else
    {

		 	my $nc = '';
			my $preline = "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			my @matches = $contents =~ /(\$\$[^\$\$]*)/g;

			for (my $i = 0; $i < scalar(@matches); $i++) {
				if ($i > 0) {
					$nc .= $preline . $matches[$i];
				} else {
					$nc .= $matches[$i];
				}
			}
			$contents = $nc;
	
      $contents =~ s/\$\$(.)/<span class="sub">&Dagger;$1<\/span>/g;
			
			
      $indicators =~ s/ /_/g;
      $html .= "<span class='ind'>$indicators" .
        "</span> <span class='field'>" . $contents . "</span><br/>\n";
    }
  }

  return $html;
}


sub to_marcxml()
{
  my ($this) = @_;

  # TODO
  return undef;
}

sub from_sequential($)
{
  my ($this, $a_sequential) = @_;

  my @fieldlist;
  foreach my $line (split(/\n/, $a_sequential))
  {
    my ($doc_no, $code, $indicators, $encoding, $contents) = $line =~ /^(\d{9}) (.{3})(.{2}) (.) (.*)/;
    push(@fieldlist, { 'code' => $code, 'indicators' => $indicators, 'contents' => $contents});
    $this->{'doc_number'} = $doc_no;
  }
  $this->{'fieldlist'} = \@fieldlist;
}

sub from_marcxml($)
{
  my ($this, $a_marcxml_record_node) = @_;

  my @fieldlist;

  my $leader = get_xml_text($a_marcxml_record_node->getElementsByTagName('leader')->item(0));
  $leader = '00000' . substr(justifyleftch($leader, 24, ' '), 5);
  push(@fieldlist, {'code' => 'LDR', 'indicators' => '  ', 'contents' => $leader});

  my @controlfields = $a_marcxml_record_node->getElementsByTagName('controlfield');
  foreach my $controlfield (@controlfields)
  {
    my $tag = $controlfield->getAttributeNode('tag')->getValue();
    my $contents = get_xml_text($controlfield);

    $contents =~ s/ /\^/g;

    $this->{'doc_number'} = $contents if ($tag eq '001');

    push(@fieldlist, {'code' => $tag, 'indicators' => '  ', 'contents' => $contents});
  }

  my @datafields = $a_marcxml_record_node->getElementsByTagName('datafield');
  foreach my $datafield (@datafields)
  {
    my $tag = $datafield->getAttributeNode('tag')->getValue();
    my $ind1 = $datafield->getAttributeNode('ind1')->getValue();
    my $ind2 = $datafield->getAttributeNode('ind2')->getValue();

    my $indicators = justifyleftch($ind1, 1, ' ') . justifyleftch($ind2, 1, ' ');

    my $fielddata = '';

    my @subfields = $datafield->getElementsByTagName('subfield');
    foreach my $subfield (@subfields)
    {
      my $sub_code = $subfield->getAttributeNode('code')->getValue();
      my $sub_contents = get_xml_text($subfield);
      $sub_contents =~ s/\r\n/ /g;
      $sub_contents =~ s/\r//g;
      $sub_contents =~ s/\n/ /g;

      $fielddata .= "\$\$$sub_code$sub_contents";
    }

    push(@fieldlist, {'code' => $tag, 'indicators' => $indicators, 'contents' => $fielddata});
  }

  $this->{'fieldlist'} = \@fieldlist;
}

sub justifyleftch($$$)
{
  my ($str, $len, $padch) = @_;

  $str = substr($str, 0, $len);
  while (length($str) < $len)
  {
      $str = $str . $padch;
  }
  return $str;
}

sub get_xml_text($)
{
  my ($node) = @_;

  return '' if (!$node);

  $node = $node->getFirstChild();
  return '' if (!$node);

  my $str = $node->getData();
  return pack('C*', unpack('U0C*', $str));
}

sub get_length($$)
{
  my ($string, $pos) = @_;

  return substr($string, $pos, 4);
}

sub build_field_list($)
{
  my ($a_data_len, $a_data) = @_;

  my @fieldlist = ();

  return \@fieldlist if (!defined($a_data_len) || !defined($a_data));

  my $data = substr($a_data, 0, $a_data_len);

  my $pos = 0;
  while ($pos < $a_data_len)
  {
    my $len = get_length($data, $pos);
		if ($len !~ /^(\d+\.?\d*|\.\d+)$/) {  # match valid number
			die("field length not numeric ($len): $data");
		}
    die("Invalid field length $len") if ($len == 0);
    my $field = substr($data, $pos + 4, $len);

    my ($code, $indicators, $contents) = $field =~ /(.{3})(.{2}).(.*)/;
    push(@fieldlist, { 'code' => $code, 'indicators' => $indicators, 'contents' => $contents});
    $pos += $len + 4;
  }
  return \@fieldlist;
}

1;
