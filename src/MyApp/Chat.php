<?php
namespace MyApp;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use MyApp\config;

class Action
{
    const CONNECT = 1;
    const SEND_MESS = 2;
    const CLOSE = 3;
}

class Chat implements MessageComponentInterface
{
    protected $clients;
    protected $sharedGames;

    public function __construct()
    {
        $this->clients = new \SplObjectStorage;
    }

    /**
     * Triggered when a user wants to subscribe
     *
     * @param {ConnectionInterface} $conn The user who wants to subscribe
     *
     * @return void
     */
    public function onOpen(ConnectionInterface $conn)
    {
        // Store the new connection to send messages to later
        $this->clients->attach($conn);

        echo "New connection! ({$conn->resourceId})\n";
    }

    /**
     * Adds a subscriber to a the sharedGames
     *
     * @param {Integer} $gameId       The id of the game that the user wants to
     *                                subsribe to
     * @param {Integer} $subscriberId The id of the user who wants to subscribe
     *
     * @return void
     */ 
    public function addSubscriber($gameId, $subscriberId)
    {
        if (is_null($this->sharedGames)) {
            $this->sharedGames = array();
        }

        if (!array_key_exists($gameId, $this->sharedGames)) {
            $this->sharedGames[$gameId] = array();
        }

        array_push($this->sharedGames[$gameId], $subscriberId);
    }
    
    /**
     * Remvoe a subscriber a subscriber to a the sharedGames
     *
     * @param {Integer} $gameId       The id of the game that the user wants to
     *                                unsubsribe from
     * @param {Integer} $subscriberId The id of the user who wants to unsubscribe
     *
     * @return void
     */ 
    public function removeSubscriber($gameId, $subscriberId)
    {
        if (($key = array_search($subscriberId, $this->sharedGames[$gameId])) !== false) {
            $this->sharedGames[$gameId] = array_diff($this->sharedGames[$gameId], array($subscriberId));
        }
    }

    /**
     * Triggered when a subscribed user sends a message
     *
     * @param {ConnectionInterface} $from The sender
     * @param {String}              $msg  The message sent from the user
     *
     * @return void
     */
    public function onMessage(ConnectionInterface $from, $msg)
    {
        $contents = json_decode($msg, true);
        // var_dump($contents['action'], $contents);
        $numRecv = count($this->clients) - 1;

        if ($contents['action'] === Action::CONNECT) {
            $this->addSubscriber($contents['gameId'], $from->resourceId);
        }

        if ($contents['action'] === Action::CLOSE) {
            $this->removeSubscriber($contents['gameId'], $from->resourceId);
        }
        if ($contents['action'] === Action::SEND_MESS) {
            $this->sendMessage($contents['gameId'], $from, $msg);
        }
        // echo sprintf(
        //     'Connection %d sending message "%s" to %d other connection%s' . "\n",
        //     $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's'
        // );
    }

    /**
     * Triggered when a subscribed user sends a message
     *
     * @param {Integer} $gameId   The id of the channel
     * @param {Integer} $clientId The id of the user
     *
     * @return {Boolean} If the user is subscribed to a the channel
     */
    public function isSubscribed($gameId, $clientId)
    {
        return $key = array_search($clientId, $this->sharedGames[$gameId], true) !== false;

    }

    /**
     * Sends a messaage to every subsribed user to the channel except for the
     * sender
     *
     * @param {Integer} $gameId The id of the channel
     * @param {Integer} $from   The user who sent the message
     * @param {String}  $msg    The message to be sent the subscribed users
     *
     * @return void
     */
    public function sendMessage($gameId, $from, $msg)
    {
        foreach ($this->clients as $client) {
            
            $userSubscribed = $this->isSubscribed($gameId, $client->resourceId);
            if ($from !== $client && $userSubscribed === true) {
                // The sender is not the receiver, send to each client connected
                $client->send($msg);
            }
        }
    }

    /**
     * Triggered when a user wants to unsubscribe
     *
     * @param {ConnectionInterface} $conn The sender
     *
     * @return void
     */
    public function onClose(ConnectionInterface $conn)
    {
        // The connection is closed, remove it, as we can no longer send it messages
        $this->clients->detach($conn);

        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    /**
     * Triggered if an error occurred
     *
     * @param {ConnectionInterface} $conn The connection of the user
     * @param {\Exception}          $e    The exception
     *
     * @return void
     */
    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "An error has occurred: {$e->getMessage()}\n";

        $conn->close();
    }
}