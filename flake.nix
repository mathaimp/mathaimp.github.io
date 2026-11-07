{
  description = "mathaimp.github.io: static personal page";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      forAll = f: nixpkgs.lib.genAttrs
        [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ]
        (system: f nixpkgs.legacyPackages.${system});
    in {
      devShells = forAll (pkgs:
        let
          serve = pkgs.writeShellScriptBin "serve" ''
            port="''${1:-8000}"
            echo "Serving on http://localhost:$port"
            exec ${pkgs.miniserve}/bin/miniserve --index index.html --port "$port" .
          '';
        in {
          default = pkgs.mkShell {
            packages = [ serve pkgs.imagemagick ];
            shellHook = ''
              echo "mathaimp.github.io dev shell"
              echo "  serve [port]   -> preview the page (default http://localhost:8000)"
            '';
          };
        });
    };
}
