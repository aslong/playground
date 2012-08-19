-module(tut4).
-export([list_length/1]).

list_length([]) ->
  0;

list_length([F | Rest]) ->
  1 + list_length(Rest).
