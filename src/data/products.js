import rainbowLizard from '../assets/products/Rainbow Bead Lizard.png';
import daisyBracelet from '../assets/products/Daisy Bead Bracelet.png';
import geometricKeychain from '../assets/products/Geometric Pattern Keychain.png';
import summerNecklace from '../assets/products/Summer Vibes Necklace.png';

export const products = [
    {
        id: 1,
        title: "Rainbow Bead Lizard",
        price: "$5.00",
        image: rainbowLizard,
        artist: {
            name: "CraftyKid_Leo",
            avatar: "https://placehold.co/30x30?text=L"
        },
        description: "Handmade with colorful plastic pony beads and strong cord. Perfect for backpacks!\nSize: approx. 4 inches."
    },
    {
        id: 2,
        title: "Daisy Bead Bracelet",
        price: "$4.50",
        image: daisyBracelet,
        artist: {
            name: "BeadMaster_Mia",
            avatar: "https://placehold.co/30x30?text=M"
        },
        description: "A cute daisy chain bracelet made with high-quality beads. Great for summer outfits!"
    },
    {
        id: 3,
        title: "Geometric Pattern Keychain",
        price: "$3.00",
        image: geometricKeychain,
        artist: {
            name: "Artisan_Sam",
            avatar: "https://placehold.co/30x30?text=S"
        },
        description: "Cool geometric patterns in vibrant colors. Sturdy and stylish keychain."
    },
    {
        id: 4,
        title: "Summer Vibes Necklace",
        price: "$6.00",
        image: summerNecklace,
        artist: {
            name: "Creative_Chloe",
            avatar: "https://placehold.co/30x30?text=C"
        },
        description: "Capture the essence of summer with this beautiful beaded necklace."
    }
];
