// Plantillas de código por defecto para los problemas.
// Se aplican cuando el problema no define una plantilla propia para el lenguaje seleccionado.
// El nombre de la clave debe coincidir con el `name` del lenguaje devuelto por /api/languages.

export const DEFAULT_TEMPLATES = {
  'C': `#include <stdio.h>

int main() {
    // Escribe tu codigo aqui
    return 0;
}
`,
  'C++': `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Escribe tu codigo aqui

    return 0;
}
`,
  'Java': `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Escribe tu codigo aqui
        sc.close();
    }
}
`,
  'Python3': `import sys
input = sys.stdin.readline

def main():
    # Escribe tu codigo aqui
    pass

if __name__ == "__main__":
    main()
`,
  'Python2': `import sys

def main():
    # Escribe tu codigo aqui
    pass

if __name__ == "__main__":
    main()
`,
  'Golang': `package main

import "fmt"

func main() {
    // Escribe tu codigo aqui
    _ = fmt.Println
}
`
}

export function getDefaultTemplate (language) {
  return DEFAULT_TEMPLATES[language] || ''
}
