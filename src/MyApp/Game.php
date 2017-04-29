<?php
namespace MyApp;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Game implements MessageComponentInterface {
    protected $gameName;

    public function __construct($gameName) {
        $this->gameName = $gameName;
    }

}