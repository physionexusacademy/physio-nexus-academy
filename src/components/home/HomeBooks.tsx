import { ArrowRight, BookOpen } from "lucide-react";
import { BOOKS, formatPkr } from "@/lib/books";

/**
 * All printed books in one horizontal row (three across, even on phones), each with a
 * small cover, its price and an Order button that opens the order form with that book
 * selected. Thumbnails are 240×360 WebP files in /images/books/thumbs/ (about 20 KB each).
 */
export function HomeBooks() {
  return (
    <section id="books" className="home-books" aria-labelledby="home-books-title" data-pna-home-books>
      <div className="container-content">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="nx-kicker nx-kicker-light"><BookOpen className="h-4 w-4" aria-hidden="true" /> Books by Dr. Sajjad Raza PT</p>
            <h2 id="home-books-title" className="nx-title mt-2 text-3xl text-navy-800 sm:text-4xl">Physiotherapy books</h2>
          </div>
          <a href="/resources" className="nx-btn nx-btn-light !min-h-[40px] !text-[0.85rem]">
            All books &amp; details <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <ul className="home-books-row">
          {BOOKS.map((book) => (
            <li key={book.id}>
              <a href={`/resources?book=${book.id}#order-book`} className="home-book" aria-label={`${book.title} — ${formatPkr(book.price)}. Order now`}>
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
                <span className="home-book-order">Order <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-slate-500">Order online in a minute — every order gets its own Order ID and a delivery estimate.</p>
      </div>
    </section>
  );
}
