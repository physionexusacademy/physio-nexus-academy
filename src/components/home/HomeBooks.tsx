import { ArrowRight, BookOpen } from "lucide-react";
import { BOOKS, formatPkr } from "@/lib/books";
import { Ur } from "@/components/Ur";

/**
 * The three printed books in one dark, glowing row (three across, even on phones), each with a small cover, its price and an Order
 * button that opens the order form with that book selected. Only three are ever shown here; the full catalogue is on /resources.
 * Thumbnails are 240×360 WebP files in /images/books/thumbs/ (about 20 KB each).
 */
const HOME_BOOK_COUNT = 3;

export function HomeBooks() {
  return (
    <section id="books" className="home-books" aria-labelledby="home-books-title" data-pna-home-books>
      <div className="container-content">
       <div className="hbk nx-sky nx-grid">
        <div className="hbk-head">
          <div>
            <p className="hbk-kicker"><BookOpen className="h-4 w-4" aria-hidden="true" /> <Ur en="Books by Dr. Sajjad Raza PT" ur="Dr. Sajjad Raza PT ki kitabein" /></p>
            <h2 id="home-books-title" className="hbk-title"><Ur en="Physiotherapy books" ur="Physiotherapy ki kitabein" /></h2>
          </div>
          <a href="/resources" className="hbk-all">
            <Ur en="All books &amp; details" ur="Tamam kitabein aur tafseel" /> <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <ul className="home-books-row">
          {BOOKS.slice(0, HOME_BOOK_COUNT).map((book) => (
            <li key={book.id}>
              <a href={`/resources?book=${book.id}#order-book`} className="home-book" aria-label={`${book.title} ${formatPkr(book.price)} Order now`}>
                <img
                  src={`/images/books/thumbs/${book.id}.webp`}
                  alt={book.cover.alt}
                  width={240}
                  height={360}
                  loading="lazy"
                  decoding="async"
                  className="home-book-cover"
                />
                <strong className="home-book-title">{book.title}</strong>
                <span className="home-book-price">{formatPkr(book.price)}</span>
                <span className="home-book-order"><Ur en="Order" ur="Order karein" /> <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
              </a>
            </li>
          ))}
        </ul>
        <p className="hbk-note"><Ur en="Order online in a minute — every order gets its own Order ID and a delivery estimate." ur="Online order ek minute mein — har order ko apna Order ID aur delivery ka andaza milta hai." /></p>
       </div>
      </div>
    </section>
  );
}
