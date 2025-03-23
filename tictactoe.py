import random
import time

class Player:
    def __init__(self, name, symbol, is_computer=False):
        self.name = name
        self.symbol = symbol
        self.is_computer = is_computer

class TicTacToe:
    def __init__(self):
        self.board = [' ' for _ in range(9)]
        self.current_winner = None

    def print_board(self):
        for row in [self.board[i:i+3] for i in range(0, 9, 3)]:
            print('| ' + ' | '.join(row) + ' |')
            print('-' * 13)

    def available_moves(self):
        return [i for i, spot in enumerate(self.board) if spot == ' ']

    def empty_squares(self):
        return ' ' in self.board

    def make_move(self, square, symbol):
        if self.board[square] == ' ':
            self.board[square] = symbol
            if self.winner(square, symbol):
                self.current_winner = symbol
            return True
        return False

    def winner(self, square, symbol):
        # check row
        row_ind = square // 3
        row = self.board[row_ind*3:(row_ind+1)*3]
        if all(spot == symbol for spot in row):
            return True

        # check column
        col_ind = square % 3
        column = [self.board[col_ind+i*3] for i in range(3)]
        if all(spot == symbol for spot in column):
            return True

        # check diagonals
        if square % 2 == 0:
            diagonal1 = [self.board[i] for i in [0, 4, 8]]
            if all(spot == symbol for spot in diagonal1):
                return True
            diagonal2 = [self.board[i] for i in [2, 4, 6]]
            if all(spot == symbol for spot in diagonal2):
                return True

        return False

def get_computer_move(game):
    square = random.choice(game.available_moves())
    return square

def play_game(player1, player2):
    game = TicTacToe()
    current_player = player1
    
    while game.empty_squares():
        print(f"\n{current_player.name}'s turn ({current_player.symbol})")
        game.print_board()

        if current_player.is_computer:
            print(f"{current_player.name} is thinking...")
            time.sleep(1)  # Add a small delay to make it more natural
            square = get_computer_move(game)
        else:
            while True:
                try:
                    square = int(input(f"{current_player.name}, enter your move (0-8): "))
                    if 0 <= square <= 8 and square in game.available_moves():
                        break
                    print("Invalid move. Try again.")
                except ValueError:
                    print("Invalid input. Please enter a number between 0-8.")

        game.make_move(square, current_player.symbol)

        if game.current_winner:
            print("\nFinal board:")
            game.print_board()
            print(f"\n{current_player.name} wins!")
            return

        current_player = player2 if current_player == player1 else player1

    print("\nFinal board:")
    game.print_board()
    print("\nIt's a tie!")

def main():
    print("Welcome to Tic-Tac-Toe!")
    print("\nGame modes:")
    print("1. Human vs Computer")
    print("2. Computer vs Computer")
    
    while True:
        try:
            mode = int(input("\nSelect game mode (1 or 2): "))
            if mode in [1, 2]:
                break
            print("Invalid mode. Please select 1 or 2.")
        except ValueError:
            print("Invalid input. Please enter 1 or 2.")

    if mode == 1:
        human_name = input("Enter your name (default: Human): ").strip() or "Human"
        computer_name = input("Enter computer's name (default: Computer): ").strip() or "Computer"
        human = Player(human_name, 'X')
        computer = Player(computer_name, 'O', is_computer=True)
        play_game(human, computer)
    else:
        computer1_name = input("Enter first computer's name (default: Computer 1): ").strip() or "Computer 1"
        computer2_name = input("Enter second computer's name (default: Computer 2): ").strip() or "Computer 2"
        computer1 = Player(computer1_name, 'X', is_computer=True)
        computer2 = Player(computer2_name, 'O', is_computer=True)
        play_game(computer1, computer2)

if __name__ == "__main__":
    main()
